"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useDashboardProject } from "@/contexts/dashboard-project-context";

const nav = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/kanban", label: "Kanban" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/chat", label: "Team chat" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/settings", label: "Settings" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { projects, selectedProjectId, setSelectedProjectId, loading: projLoading } = useDashboardProject();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-slate-950/95 py-6 md:flex">
        <div className="px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">TaskForge</p>
          <p className="mt-1 truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <nav className="mt-8 flex flex-col gap-0.5 px-2">
          {nav.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-indigo-500/20 font-medium text-indigo-100" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-4 pt-6">
          <Link href="/" className="block text-xs text-slate-500 hover:text-slate-300">
            ← Marketing site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <label className="text-xs text-slate-500 md:hidden">Project</label>
            <select
              className="max-w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none md:max-w-xs"
              disabled={projLoading || projects.length === 0}
              value={selectedProjectId ?? ""}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
            >
              {projects.length === 0 ? <option value="">No projects</option> : null}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:inline">{user?.role}</span>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10 sm:text-sm"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="border-b border-white/10 px-4 py-2 md:hidden">
          <nav className="flex flex-wrap gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-2 py-1 text-xs ${isActive(pathname, item.href, item.exact) ? "bg-indigo-500/25 text-indigo-100" : "text-slate-400"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <main className="flex-1 overflow-auto px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
