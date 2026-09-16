import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Shell } from "@/components/shell";
import { NewDeliveryForm } from "@/components/new-delivery-form";

export const dynamic = "force-dynamic";

export default async function NewDeliveryPage() {
  const user = await requireUser();
  const all = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .orderBy(asc(clients.name));

  return (
    <Shell user={user}>
      <h1 className="text-xl font-semibold text-ink-50">New delivery</h1>

      {all.length === 0 ? (
        <p className="mt-6 text-sm text-ink-400">
          Add a{" "}
          <Link href="/clients" className="text-accent hover:underline">
            client
          </Link>{" "}
          first.
        </p>
      ) : (
        <div className="mt-6">
          <NewDeliveryForm clients={all} />
        </div>
      )}
    </Shell>
  );
}
