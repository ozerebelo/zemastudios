import { asc } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Shell } from "@/components/shell";
import { NewClientForm } from "@/components/new-client-form";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await requireUser();
  const all = await db.select().from(clients).orderBy(asc(clients.name));

  return (
    <Shell user={user}>
      <h1 className="text-xl font-semibold text-ink-50">Clients</h1>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          {all.length === 0 ? (
            <p className="text-sm text-ink-400">No clients yet.</p>
          ) : (
            <ul className="divide-y divide-ink-800 rounded-lg border border-ink-800">
              {all.map((client) => (
                <li key={client.id} className="px-4 py-3">
                  <div className="text-sm font-medium text-ink-50">
                    {client.name}
                  </div>
                  {client.contactEmail && (
                    <div className="text-xs text-ink-400">
                      {client.contactEmail}
                    </div>
                  )}
                  {client.notes && (
                    <p className="mt-1 text-xs text-ink-500">{client.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside>
          <h2 className="mb-3 text-sm font-medium text-ink-300">New client</h2>
          <NewClientForm />
        </aside>
      </div>
    </Shell>
  );
}
