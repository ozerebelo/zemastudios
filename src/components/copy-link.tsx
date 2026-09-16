"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access is blocked outside a secure context; the input is
      // selectable so the link is still reachable by hand.
      setCopied(false);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={url}
        onFocus={(event) => event.currentTarget.select()}
        className="field font-mono text-xs"
      />
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md border border-ink-700 px-3 py-2 text-sm text-ink-200 transition hover:border-ink-600 hover:text-ink-50"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
