import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { deliveryFiles } from "@/db/schema";
import {
  resolveDelivery,
  checkGate,
  logAccess,
  countDownload,
} from "@/lib/deliveries";
import { presignDownload } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; fileId: string }> },
) {
  const { token, fileId } = await params;

  const resolved = await resolveDelivery(token);
  if (!resolved) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const gate = await checkGate(resolved.delivery);
  if (gate) {
    // Bounce back to the link page, which explains why rather than 403ing at
    // a bare JSON endpoint.
    return NextResponse.redirect(new URL(`/d/${token}`, _request.url));
  }

  const rows = await db
    .select()
    .from(deliveryFiles)
    .where(
      and(
        eq(deliveryFiles.id, fileId),
        eq(deliveryFiles.deliveryId, resolved.delivery.id),
        eq(deliveryFiles.uploaded, true),
      ),
    )
    .limit(1);

  const file = rows[0];
  if (!file) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await logAccess({
    deliveryId: resolved.delivery.id,
    type: "download_file",
    fileId: file.id,
    detail: file.filename,
  });
  await countDownload(resolved.delivery.id);

  return NextResponse.redirect(
    await presignDownload(file.storageKey, file.filename),
  );
}
