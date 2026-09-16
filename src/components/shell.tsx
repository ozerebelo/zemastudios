import Link from "next/link";
import { logout } from "@/app/actions";
import type { User } from "@/db/schema";

const NAV = [
  { href: "/dashboard", label: "Deliveries" },
  { href: "/clients", label: "Clients" },
];

export function Shell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-800 bg-ink-900">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link href="/dashboard" className="text-sm font-semibold text-ink-50">
            Zema<span className="text-accent">.</span>Delivery
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-300 transition hover:text-ink-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-ink-400 sm:inline">{user.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-ink-400 transition hover:text-ink-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
