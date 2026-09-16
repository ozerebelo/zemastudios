import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { eq, asc, and, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  deliveries,
  deliveryFiles,
  clients,
  accessEvents,
  type Delivery,
  type DeliveryFile,
  type Client,
} from "@/db/schema";
import { hashToken } from "./crypto";

export type ResolvedDelivery = {
  delivery: Delivery;
  client: Client;
  files: DeliveryFile[];
};

/** Why a share link is not currently usable. */
export type GateFailure =
  | "not_found"
  | "revoked"
  | "draft"
  | "expired"
  | "download_limit"
  | "locked";

export async function resolveDelivery(
  token: string,
): Promise<ResolvedDelivery | null> {
  const rows = await db
    .select({ delivery: deliveries, client: clients })
    .from(deliveries)
    .innerJoin(clients, eq(deliveries.clientId, clients.id))
    .where(eq(deliveries.tokenHash, hashToken(token)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const files = await db
    .select()
    .from(deliveryFiles)
    .where(eq(deliveryFiles.deliveryId, row.delivery.id))
    .orderBy(asc(deliveryFiles.filename));

  return {
    delivery: row.delivery,
    client: row.client,
    files: files.filter((f) => f.uploaded),
  };
}

/**
 * Everything that can stop a recipient getting at a delivery, checked in the
 * order a recipient would hit them. `locked` is last because an expired or
 * revoked link should not prompt for a password it will never accept.
 */
export async function checkGate(
  delivery: Delivery,
): Promise<GateFailure | null> {
  if (delivery.status === "revoked") return "revoked";
  if (delivery.status === "draft") return "draft";

  if (delivery.expiresAt && delivery.expiresAt.getTime() < Date.now()) {
    return "expired";
  }

  if (
    delivery.maxDownloads !== null &&
    delivery.downloadCount >= delivery.maxDownloads
  ) {
    return "download_limit";
  }

  if (delivery.passwordHash && !(await isUnlocked(delivery.id))) {
    return "locked";
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Password gate                                                       */
/* ------------------------------------------------------------------ */

function unlockSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function unlockCookieName(deliveryId: string): string {
  return `zema_unlock_${deliveryId}`;
}

function unlockValue(deliveryId: string): string {
  return createHmac("sha256", unlockSecret()).update(deliveryId).digest("hex");
}

export async function markUnlocked(deliveryId: string): Promise<void> {
  const jar = await cookies();
  jar.set(unlockCookieName(deliveryId), unlockValue(deliveryId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function isUnlocked(deliveryId: string): Promise<boolean> {
  const jar = await cookies();
  const present = jar.get(unlockCookieName(deliveryId))?.value;
  if (!present) return false;

  const expected = unlockValue(deliveryId);
  if (present.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(present), Buffer.from(expected));
}

/* ------------------------------------------------------------------ */
/* Audit trail                                                         */
/* ------------------------------------------------------------------ */

type LogArgs = {
  deliveryId: string;
  type: (typeof accessEvents.type.enumValues)[number];
  fileId?: string | null;
  detail?: string;
};

export async function logAccess({
  deliveryId,
  type,
  fileId = null,
  detail,
}: LogArgs): Promise<void> {
  const h = await headers();

  // Behind a proxy the first XFF hop is the real client.
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

  await db.insert(accessEvents).values({
    deliveryId,
    fileId,
    type,
    ip,
    userAgent: h.get("user-agent")?.slice(0, 500) ?? null,
    detail: detail ?? null,
  });
}

export function shareUrl(token: string): string {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/d/${token}`;
}

/**
 * A server component re-renders on every navigation, so an unconditional
 * insert would fill the activity feed with duplicates from a single visit.
 * One "viewed" row per IP per window is enough to answer "did they open it".
 */
const VIEW_WINDOW_MS = 30 * 60 * 1000;

export async function logViewThrottled(deliveryId: string): Promise<void> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

  const recent = await db
    .select({ id: accessEvents.id })
    .from(accessEvents)
    .where(
      and(
        eq(accessEvents.deliveryId, deliveryId),
        eq(accessEvents.type, "viewed"),
        ip ? eq(accessEvents.ip, ip) : isNull(accessEvents.ip),
        gt(accessEvents.createdAt, new Date(Date.now() - VIEW_WINDOW_MS)),
      ),
    )
    .limit(1);

  if (recent.length > 0) return;
  await logAccess({ deliveryId, type: "viewed" });
}

/** Counted against maxDownloads; a zip of everything counts as one. */
export async function countDownload(deliveryId: string): Promise<void> {
  await db
    .update(deliveries)
    .set({ downloadCount: sql`${deliveries.downloadCount} + 1` })
    .where(eq(deliveries.id, deliveryId));
}
