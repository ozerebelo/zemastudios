import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import archiver from "archiver";
import {
  resolveDelivery,
  checkGate,
  logAccess,
  countDownload,
} from "@/lib/deliveries";
import { getObjectStream } from "@/lib/storage";
import { slugify } from "@/lib/files";

export const runtime = "nodejs";
// The zip is produced on the fly, so the response has to stream rather than
// be buffered or cached.
export const dynamic = "force-dynamic";

/**
 * Defers the storage GET until the archiver actually pulls from this entry.
 * Opening every object up front would hold a connection per file open while
 * the archive works through them one at a time.
 */
function lazyObjectStream(key: string): Readable {
  return Readable.from(
    (async function* () {
      const source = await getObjectStream(key);
      for await (const chunk of source) yield chunk;
    })(),
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const resolved = await resolveDelivery(token);
  if (!resolved) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const gate = await checkGate(resolved.delivery);
  if (gate) {
    return NextResponse.redirect(new URL(`/d/${token}`, request.url));
  }

  const { delivery, files } = resolved;
  if (files.length === 0) {
    return NextResponse.json({ error: "nothing to download" }, { status: 404 });
  }

  await logAccess({
    deliveryId: delivery.id,
    type: "download_all",
    detail: `${files.length} files`,
  });
  await countDownload(delivery.id);

  // Project files, LUTs and effect bundles are already compact or already
  // compressed; store-only keeps the studio's CPU out of the transfer.
  const archive = archiver("zip", { zlib: { level: 0 } });

  archive.on("error", (error) => {
    console.error(`[zip] delivery ${delivery.id}`, error);
    archive.destroy(error);
  });

  for (const file of files) {
    archive.append(lazyObjectStream(file.storageKey), {
      name: file.filename,
    });
  }

  void archive.finalize();

  const filename = `${slugify(delivery.title)}.zip`;

  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
