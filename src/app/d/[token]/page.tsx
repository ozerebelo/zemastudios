import type { Metadata } from "next";
import {
  resolveDelivery,
  checkGate,
  logViewThrottled,
  type GateFailure,
} from "@/lib/deliveries";
import { formatBytes, KIND_LABELS } from "@/lib/files";
import { UnlockForm } from "@/components/unlock-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zema Studios delivery",
  // A share link is a bearer credential; keep it out of search results.
  robots: { index: false, follow: false },
};

const GATE_MESSAGES: Record<Exclude<GateFailure, "locked">, string> = {
  not_found: "This link is not valid. Check with your contact at Zema Studios.",
  revoked: "This link has been revoked. Get in touch for a new one.",
  draft: "This delivery is not ready yet.",
  expired: "This link has expired. Get in touch for a new one.",
  download_limit:
    "This link has reached its download limit. Get in touch for a new one.",
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <p className="text-sm font-semibold tracking-tight text-ink-50">
          Zema<span className="text-accent">.</span>Studios
        </p>
        {children}
      </div>
    </div>
  );
}

export default async function DeliveryLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const resolved = await resolveDelivery(token);

  if (!resolved) {
    return (
      <Frame>
        <p className="mt-6 text-sm text-ink-400">
          {GATE_MESSAGES.not_found}
        </p>
      </Frame>
    );
  }

  const { delivery, files } = resolved;
  const gate = await checkGate(delivery);

  if (gate === "locked") {
    return (
      <Frame>
        <h1 className="mt-6 text-lg font-medium text-ink-50">
          {delivery.title}
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          This delivery is password protected.
        </p>
        <UnlockForm token={token} />
      </Frame>
    );
  }

  if (gate) {
    return (
      <Frame>
        <p className="mt-6 text-sm text-ink-400">{GATE_MESSAGES[gate]}</p>
      </Frame>
    );
  }

  await logViewThrottled(delivery.id);

  const totalBytes = files.reduce((sum, f) => sum + Number(f.sizeBytes), 0);

  return (
    <Frame>
      <h1 className="mt-6 text-lg font-medium text-ink-50">{delivery.title}</h1>

      {delivery.message && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-300">
          {delivery.message}
        </p>
      )}

      {(delivery.resolveVersion || delivery.studioRequired) && (
        <div className="mt-5 rounded-lg border border-ink-800 bg-ink-900 px-4 py-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-ink-500">
            Before you open this
          </p>
          <ul className="mt-2 space-y-1 text-ink-300">
            {delivery.resolveVersion && (
              <li>
                Saved in DaVinci Resolve{" "}
                <span className="text-ink-50">{delivery.resolveVersion}</span>.
                Older builds will not open it.
              </li>
            )}
            {delivery.studioRequired && (
              <li>Requires Resolve Studio, not the free edition.</li>
            )}
          </ul>
        </div>
      )}

      {files.length === 0 ? (
        <p className="mt-6 text-sm text-ink-400">
          No files are attached to this delivery yet.
        </p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-ink-800 rounded-lg border border-ink-800">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-ink-100">{file.filename}</div>
                  <div className="text-xs text-ink-500">
                    {KIND_LABELS[file.kind]} &middot;{" "}
                    {formatBytes(Number(file.sizeBytes))}
                  </div>
                </div>
                <a
                  href={`/api/d/${token}/download/${file.id}`}
                  className="shrink-0 rounded-md border border-ink-700 px-3 py-1.5 text-xs text-ink-200 transition hover:border-ink-600 hover:text-ink-50"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>

          {files.length > 1 && (
            <a
              href={`/api/d/${token}/download-all`}
              className="mt-4 block rounded-md bg-accent px-4 py-2.5 text-center text-sm font-medium text-ink-950 transition hover:brightness-110"
            >
              Download all ({formatBytes(totalBytes)})
            </a>
          )}
        </>
      )}

      {delivery.expiresAt && (
        <p className="mt-6 text-xs text-ink-500">
          This link expires {delivery.expiresAt.toLocaleDateString()}.
        </p>
      )}
    </Frame>
  );
}
