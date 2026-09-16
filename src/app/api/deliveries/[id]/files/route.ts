import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { deliveries, deliveryFiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { presignUpload, deleteObject, storageKeyFor } from "@/lib/storage";
import { kindForFilename, sanitizeFilename } from "@/lib/files";

type Params = { params: Promise<{ id: string }> };

/**
 * A single presigned PUT tops out at 5 GB, which comfortably covers project
 * files, LUTs and effect bundles. Zipped archives beyond that need multipart
 * -- see the README.
 */
const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES ?? 5 * 1024 ** 3);

async function loadDelivery(id: string) {
  const rows = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Reserve a row and hand back a URL the browser uploads straight to. */
export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await loadDelivery(id))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.filename || typeof body.sizeBytes !== "number") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const filename = sanitizeFilename(String(body.filename));
  if (body.sizeBytes > MAX_BYTES) {
    return NextResponse.json(
      { error: `File exceeds the ${MAX_BYTES} byte limit.` },
      { status: 413 },
    );
  }

  const [file] = await db
    .insert(deliveryFiles)
    .values({
      deliveryId: id,
      filename,
      kind: kindForFilename(filename),
      sizeBytes: body.sizeBytes,
      sha256: typeof body.sha256 === "string" ? body.sha256 : null,
      storageKey: "pending",
    })
    .returning({ id: deliveryFiles.id });

  const storageKey = storageKeyFor(id, file.id, filename);
  await db
    .update(deliveryFiles)
    .set({ storageKey })
    .where(eq(deliveryFiles.id, file.id));

  const uploadUrl = await presignUpload(
    storageKey,
    String(body.contentType || "application/octet-stream"),
  );

  return NextResponse.json({ fileId: file.id, uploadUrl });
}

/** The browser calls this once the PUT returns 200. */
export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.fileId) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  await db
    .update(deliveryFiles)
    .set({ uploaded: true })
    .where(
      and(
        eq(deliveryFiles.id, String(body.fileId)),
        eq(deliveryFiles.deliveryId, id),
      ),
    );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const fileId = new URL(request.url).searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(deliveryFiles)
    .where(
      and(eq(deliveryFiles.id, fileId), eq(deliveryFiles.deliveryId, id)),
    )
    .limit(1);

  const file = rows[0];
  if (!file) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Storage first: a stale object is worse than a stale row, since the row is
  // what the UI reads.
  await deleteObject(file.storageKey).catch((error) => {
    console.error(`[storage] failed to delete ${file.storageKey}`, error);
  });
  await db.delete(deliveryFiles).where(eq(deliveryFiles.id, fileId));

  return NextResponse.json({ ok: true });
}
