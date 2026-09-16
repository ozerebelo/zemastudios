"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatBytes, KIND_LABELS, type FileKind } from "@/lib/files";

export type FileRow = {
  id: string;
  filename: string;
  kind: FileKind;
  sizeBytes: number;
  sha256: string | null;
};

export function FileList({
  deliveryId,
  files,
}: {
  deliveryId: string;
  files: FileRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [removing, setRemoving] = useState<string | null>(null);

  async function remove(fileId: string) {
    setRemoving(fileId);
    await fetch(`/api/deliveries/${deliveryId}/files?fileId=${fileId}`, {
      method: "DELETE",
    });
    setRemoving(null);
    startTransition(() => router.refresh());
  }

  if (files.length === 0) {
    return <p className="text-sm text-ink-500">No files attached yet.</p>;
  }

  return (
    <ul className="divide-y divide-ink-800 rounded-lg border border-ink-800">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center gap-3 px-4 py-3 text-sm"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-ink-100">
              {file.filename}
            </div>
            <div className="text-xs text-ink-500">
              {KIND_LABELS[file.kind]} &middot; {formatBytes(file.sizeBytes)}
              {file.sha256 && (
                <span className="ml-2 font-mono">
                  sha256 {file.sha256.slice(0, 12)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void remove(file.id)}
            disabled={pending || removing === file.id}
            className="shrink-0 text-xs text-ink-500 transition hover:text-red-400 disabled:opacity-50"
          >
            {removing === file.id ? "Removing..." : "Remove"}
          </button>
        </li>
      ))}
    </ul>
  );
}
