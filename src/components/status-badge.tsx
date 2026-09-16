import type { Delivery } from "@/db/schema";

type Tone = "draft" | "live" | "warn" | "dead";

const TONES: Record<Tone, string> = {
  draft: "border-ink-600 text-ink-400",
  live: "border-emerald-700 text-emerald-400",
  warn: "border-amber-700 text-amber-400",
  dead: "border-red-800 text-red-400",
};

/**
 * The stored status alone is not the whole story -- a "sent" delivery can be
 * expired or used up, and the recipient sees that, so the dashboard should
 * too.
 */
export function effectiveStatus(delivery: Delivery): {
  label: string;
  tone: Tone;
} {
  if (delivery.status === "revoked") return { label: "Revoked", tone: "dead" };
  if (delivery.status === "draft") return { label: "Draft", tone: "draft" };

  if (delivery.expiresAt && delivery.expiresAt.getTime() < Date.now()) {
    return { label: "Expired", tone: "warn" };
  }

  if (
    delivery.maxDownloads !== null &&
    delivery.downloadCount >= delivery.maxDownloads
  ) {
    return { label: "Limit reached", tone: "warn" };
  }

  return { label: "Live", tone: "live" };
}

export function StatusBadge({ delivery }: { delivery: Delivery }) {
  const { label, tone } = effectiveStatus(delivery);

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {label}
    </span>
  );
}
