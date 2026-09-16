import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, asc } from "drizzle-orm";
import { db } from "@/db";
import {
  deliveries,
  clients,
  deliveryFiles,
  accessEvents,
  type AccessEvent,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { unseal } from "@/lib/crypto";
import { shareUrl } from "@/lib/deliveries";
import { revokeDelivery } from "@/app/actions";
import { Shell } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { CopyLink } from "@/components/copy-link";
import { FileList } from "@/components/file-list";
import { Uploader } from "@/components/uploader";
import { SendDeliveryForm } from "@/components/send-delivery-form";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<AccessEvent["type"], string> = {
  viewed: "Opened the link",
  unlocked: "Entered the password",
  download_file: "Downloaded",
  download_all: "Downloaded everything",
  denied: "Access denied",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium text-ink-300">{title}</h2>
      {children}
    </section>
  );
}

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const rows = await db
    .select({ delivery: deliveries, client: clients })
    .from(deliveries)
    .innerJoin(clients, eq(deliveries.clientId, clients.id))
    .where(eq(deliveries.id, id))
    .limit(1);

  if (!rows[0]) notFound();
  const { delivery, client } = rows[0];

  const [files, events] = await Promise.all([
    db
      .select()
      .from(deliveryFiles)
      .where(eq(deliveryFiles.deliveryId, id))
      .orderBy(asc(deliveryFiles.filename)),
    db
      .select()
      .from(accessEvents)
      .where(eq(accessEvents.deliveryId, id))
      .orderBy(desc(accessEvents.createdAt))
      .limit(50),
  ]);

  const url = shareUrl(unseal(delivery.tokenSealed));

  return (
    <Shell user={user}>
      <Link
        href="/dashboard"
        className="text-xs text-ink-500 transition hover:text-ink-300"
      >
        &larr; All deliveries
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-ink-50">{delivery.title}</h1>
        <StatusBadge delivery={delivery} />
      </div>
      <p className="mt-1 text-sm text-ink-400">
        For {client.name}
        {delivery.expiresAt &&
          ` · expires ${delivery.expiresAt.toLocaleDateString()}`}
        {delivery.passwordHash && " · password protected"}
      </p>

      <Section title="Files">
        <FileList
          deliveryId={delivery.id}
          files={files.map((f) => ({
            id: f.id,
            filename: f.filename,
            kind: f.kind,
            sizeBytes: Number(f.sizeBytes),
            sha256: f.sha256,
          }))}
        />
        <div className="mt-4">
          <Uploader deliveryId={delivery.id} />
        </div>
      </Section>

      <Section title="Share link">
        <CopyLink url={url} />
        <div className="mt-3">
          <SendDeliveryForm
            deliveryId={delivery.id}
            defaultEmail={client.contactEmail ?? ""}
            alreadySent={delivery.status === "sent"}
          />
        </div>

        {delivery.status !== "revoked" && (
          <form action={revokeDelivery} className="mt-4">
            <input type="hidden" name="deliveryId" value={delivery.id} />
            <button
              type="submit"
              className="text-xs text-ink-500 transition hover:text-red-400"
            >
              Revoke this link
            </button>
          </form>
        )}
      </Section>

      <Section title="Activity">
        {events.length === 0 ? (
          <p className="text-sm text-ink-500">
            Nothing yet. Views and downloads will show up here.
          </p>
        ) : (
          <ul className="divide-y divide-ink-800 rounded-lg border border-ink-800 text-sm">
            {events.map((event) => (
              <li key={event.id} className="flex gap-3 px-4 py-2.5">
                <span className="text-ink-200">
                  {EVENT_LABELS[event.type]}
                  {event.detail && (
                    <span className="text-ink-500"> &middot; {event.detail}</span>
                  )}
                </span>
                <span className="ml-auto shrink-0 text-xs text-ink-500">
                  {event.createdAt.toLocaleString()}
                  {event.ip && ` · ${event.ip}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Shell>
  );
}
