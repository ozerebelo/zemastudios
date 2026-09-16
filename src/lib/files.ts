import type { fileKind } from "@/db/schema";

export type FileKind = (typeof fileKind.enumValues)[number];

const EXTENSION_KINDS: Record<string, FileKind> = {
  drp: "project",
  drt: "timeline",
  drx: "grade",
  drfx: "effect",
  cube: "lut",
  dra: "archive",
  zip: "archive",
};

export const KIND_LABELS: Record<FileKind, string> = {
  project: "Resolve project",
  timeline: "Timeline",
  grade: "Grade / still",
  effect: "Effect bundle",
  lut: "LUT",
  archive: "Archive",
  other: "File",
};

export function kindForFilename(filename: string): FileKind {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_KINDS[ext] ?? "other";
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, i);
  return `${value >= 100 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

/**
 * Strips directory components and anything that would let a filename escape
 * its prefix or confuse Content-Disposition.
 */
export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "file";
  // eslint-disable-next-line no-control-regex
  const cleaned = base.replace(/[\x00-\x1f\x7f"]/g, "").trim();
  return cleaned.length > 0 ? cleaned.slice(0, 255) : "file";
}

/** Used for the generated zip filename. */
export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "delivery"
  );
}
