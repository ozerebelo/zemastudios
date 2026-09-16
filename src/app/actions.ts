"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, clients, deliveries } from "@/db/schema";
import {
  createSession,
  destroySession,
  pruneExpiredSessions,
  requireUser,
} from "@/lib/auth";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  hashToken,
  seal,
  unseal,
} from "@/lib/crypto";
import { logAccess, markUnlocked, resolveDelivery, shareUrl } from "@/lib/deliveries";
import { sendEmail } from "@/lib/email";

/**
 * `values` carries submitted fields back to the form. React 19 resets an
 * uncontrolled form once its action resolves, so without this a failed login
 * would also wipe the email the user just typed.
 */
export type ActionState = {
  error?: string;
  ok?: string;
  values?: Record<string, string>;
} | null;

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required.", values: { email } };
  }

  const found = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = found[0];
  // Same message either way so the form does not confirm which emails exist.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password.", values: { email } };
  }

  await pruneExpiredSessions();
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

/* ------------------------------------------------------------------ */
/* Clients                                                             */
/* ------------------------------------------------------------------ */

export async function createClient(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "A client name is required." };

  const contactEmail = String(formData.get("contactEmail") ?? "").trim();

  await db.insert(clients).values({
    name,
    contactEmail: contactEmail || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePath("/clients");
  return { ok: `Added ${name}.` };
}

/* ------------------------------------------------------------------ */
/* Deliveries                                                          */
/* ------------------------------------------------------------------ */

export async function createDelivery(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const clientId = String(formData.get("clientId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!clientId) return { error: "Pick a client." };
  if (!title) return { error: "Give the delivery a title." };

  const expiresInDays = Number(formData.get("expiresInDays") ?? 0);
  const maxDownloads = Number(formData.get("maxDownloads") ?? 0);
  const password = String(formData.get("password") ?? "");

  const token = generateToken();

  const [created] = await db
    .insert(deliveries)
    .values({
      clientId,
      createdBy: user.id,
      title,
      message: String(formData.get("message") ?? "").trim() || null,
      resolveVersion:
        String(formData.get("resolveVersion") ?? "").trim() || null,
      studioRequired: formData.get("studioRequired") === "on",
      tokenHash: hashToken(token),
      tokenSealed: seal(token),
      passwordHash: password ? await hashPassword(password) : null,
      expiresAt:
        expiresInDays > 0
          ? new Date(Date.now() + expiresInDays * 86_400_000)
          : null,
      maxDownloads: maxDownloads > 0 ? maxDownloads : null,
    })
    .returning({ id: deliveries.id });

  redirect(`/deliveries/${created.id}`);
}

/** Flips a draft to sent and optionally emails the client the share link. */
export async function sendDelivery(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("deliveryId") ?? "");
  const rows = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.id, id))
    .limit(1);

  const delivery = rows[0];
  if (!delivery) return { error: "Delivery not found." };

  await db
    .update(deliveries)
    .set({ status: "sent", sentAt: delivery.sentAt ?? new Date() })
    .where(eq(deliveries.id, id));

  revalidatePath(`/deliveries/${id}`);
  revalidatePath("/dashboard");

  const to = String(formData.get("notifyEmail") ?? "").trim();
  if (!to) return { ok: "Delivery is live. Copy the link below to share it." };

  const url = shareUrl(unseal(delivery.tokenSealed));
  const result = await sendEmail({
    to,
    subject: `Zema Studios - ${delivery.title}`,
    text: [
      `${delivery.title}`,
      delivery.message ? `\n${delivery.message}\n` : "",
      `Download: ${url}`,
      delivery.expiresAt
        ? `\nThis link expires ${delivery.expiresAt.toUTCString()}.`
        : "",
      delivery.passwordHash
        ? "\nThis link is password protected - the password was sent separately."
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return result.delivered
    ? { ok: `Sent to ${to}.` }
    : {
        ok: `Delivery is live, but email is not configured (${result.reason}). Copy the link below.`,
      };
}

export async function revokeDelivery(formData: FormData): Promise<void> {
  await requireUser();

  const id = String(formData.get("deliveryId") ?? "");
  await db
    .update(deliveries)
    .set({ status: "revoked" })
    .where(eq(deliveries.id, id));

  revalidatePath(`/deliveries/${id}`);
  revalidatePath("/dashboard");
}

/* ------------------------------------------------------------------ */
/* Recipient side                                                      */
/* ------------------------------------------------------------------ */

export async function unlockDelivery(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  const resolved = await resolveDelivery(token);
  if (!resolved) return { error: "This link is not valid." };

  const { delivery } = resolved;
  if (!delivery.passwordHash) return { ok: "Unlocked." };

  if (!(await verifyPassword(password, delivery.passwordHash))) {
    await logAccess({
      deliveryId: delivery.id,
      type: "denied",
      detail: "incorrect password",
    });
    return { error: "Incorrect password." };
  }

  await markUnlocked(delivery.id);
  await logAccess({ deliveryId: delivery.id, type: "unlocked" });
  redirect(`/d/${token}`);
}
