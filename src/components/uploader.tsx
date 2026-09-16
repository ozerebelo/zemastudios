"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatBytes } from "@/lib/files";

/** Above this, hashing in the browser costs more memory than it is worth. */
const HASH_LIMIT_BYTES = 200 * 1024 * 1024;

type Item = {
  key: string;
  name: string;
  size: number;
  progress: number;
  state: "hashing" | "uploading" | "done" | "error";
  error?: string;
};

async function sha256Hex(file: File): Promise<string | null> {
  if (file.size > HASH_LIMIT_BYTES) return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** XHR rather than fetch: fetch still cannot report upload progress. */
function putWithProgress(
  url: string,
  file: File,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    });

    xhr.addEventListener("load", () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Storage rejected the upload (${xhr.status})`)),
    );
    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload")),
    );

    xhr.send(file);
  });
}

export function Uploader({ deliveryId }: { deliveryId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);

  const update = useCallback((key: string, patch: Partial<Item>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }, []);

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const queued: Item[] = files.map((file) => ({
        key: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        name: file.name,
        size: file.size,
        progress: 0,
        state: "hashing",
      }));
      setItems((prev) => [...prev, ...queued]);

      // Sequential: parallel uploads of large files mostly just contend for
      // the same uplink and make every progress bar useless.
      for (const [index, file] of files.entries()) {
        const item = queued[index];
        try {
          const sha256 = await sha256Hex(file);
          update(item.key, { state: "uploading" });

          const created = await fetch(
            `/api/deliveries/${deliveryId}/files`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: file.name,
                sizeBytes: file.size,
                contentType: file.type || "application/octet-stream",
                sha256,
              }),
            },
          );

          if (!created.ok) {
            const body = await created.json().catch(() => ({}));
            throw new Error(body.error ?? `Could not start upload (${created.status})`);
          }

          const { fileId, uploadUrl } = await created.json();

          await putWithProgress(uploadUrl, file, (fraction) =>
            update(item.key, { progress: fraction }),
          );

          await fetch(`/api/deliveries/${deliveryId}/files`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
          });

          update(item.key, { state: "done", progress: 1 });
        } catch (error) {
          update(item.key, {
            state: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          });
        }
      }

      router.refresh();
    },
    [deliveryId, router, update],
  );

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(Array.from(event.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-accent bg-ink-900"
            : "border-ink-700 hover:border-ink-600"
        }`}
      >
        <p className="text-sm text-ink-300">
          Drop files here, or click to browse
        </p>
        <p className="mt-1 text-xs text-ink-500">
          .drp, .drt, .drx, .drfx, .cube, or a zipped archive
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            void upload(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="rounded-md border border-ink-800 bg-ink-900 px-3 py-2"
            >
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-ink-200">{item.name}</span>
                <span className="shrink-0 text-xs text-ink-500">
                  {item.state === "hashing"
                    ? "Checksumming..."
                    : item.state === "error"
                      ? "Failed"
                      : item.state === "done"
                        ? formatBytes(item.size)
                        : `${Math.round(item.progress * 100)}%`}
                </span>
              </div>

              {item.state === "uploading" && (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${item.progress * 100}%` }}
                  />
                </div>
              )}

              {item.error && (
                <p className="mt-1 text-xs text-red-400">{item.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
