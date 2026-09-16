import Link from "next/link";
import { desc, eq, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { deliveries, clients, deliveryFiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Shell } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { formatBytes } from "@/lib/files";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const rows = await db
    .select({ delivery: deliveries, client: clients })
    .from(deliveries)
    .innerJoin(clients, eq(deliveries.clientId, clients.id))
    .orderBy(desc(deliveries.createdAt))
    .limit(100);

  // One grouped query rather than a count per row.
  const ids = rows.map((r) => r.delivery.id);
  const totals = ids.length
    ? await db
        .select({
          deliveryId: deliveryFiles.deliveryId,
          fileCount: sql<number>`count(*)::int`,
          totalBytes: sql<number>`coalesce(sum(${deliveryFiles.sizeBytes}), 0)::bigint`,
        })
        .from(deliveryFiles)
        .where(inArray(deliveryFiles.deliveryId, ids))
        .groupBy(deliveryFiles.deliveryId)
    : [];

  const totalsById = new Map(totals.map((t) => [t.deliveryId, t]));

  return (
    <Shell user={user}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-50">Deliveries</h1>
        <Link
          href="/deliveries/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-ink-950 transition hover:brightness-110"
        >
          New delivery
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-ink-400">
          No deliveries yet. Create one to get started.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-900 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Delivery</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Files</th>
                <th className="px-4 py-2.5 font-medium">Downloads</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ delivery, client }) => {
                const totals = totalsById.get(delivery.id);
                return (
                  <tr
                    key={delivery.id}
                    className="border-t border-ink-800 bg-ink-950 transition hover:bg-ink-900"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/deliveries/${delivery.id}`}
                        className="font-medium text-ink-50 hover:text-accent"
                      >
                        {delivery.title}
                      </Link>
                      <div className="text-xs text-ink-500">
                        {delivery.createdAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-300">{client.name}</td>
                    <td className="px-4 py-3 text-ink-300">
                      {totals?.fileCount ?? 0}
                      {totals?.totalBytes ? (
                        <span className="text-ink-500">
                          {" "}
                          / {formatBytes(Number(totals.totalBytes))}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-300">
                      {delivery.downloadCount}
                      {delivery.maxDownloads ? ` / ${delivery.maxDownloads}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge delivery={delivery} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
