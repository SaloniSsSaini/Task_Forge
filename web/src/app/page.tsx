import Link from "next/link";

const features = [
  {
    title: "Workspaces & RBAC",
    desc: "Orgs, roles, and permissions so the right people see the right work.",
    span: "lg:col-span-2",
  },
  {
    title: "Projects & delivery",
    desc: "Scrum, Kanban, Agile, or Waterfall — model how your team actually ships.",
    span: "",
  },
  {
    title: "Tasks that scale",
    desc: "Priorities, statuses, assignees, due dates, and audit-friendly history.",
    span: "",
  },
  {
    title: "Realtime & AI-ready",
    desc: "Socket layer + assistant hooks for summaries, risk hints, and workload balance.",
    span: "lg:col-span-2",
  },
];

const stack = ["Next.js 15", "React 19", "TypeScript", "Tailwind", "Express", "Prisma", "JWT + refresh", "SQLite → Postgres"];

function IconSpark() {
  return (
    <svg className="h-5 w-5 text-amber-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.2 5.4L19 9l-5.8 1.6L12 16l-1.2-5.4L5 9l5.8-1.6L12 2zm0 18l1.2-2.2L15 18l-2.2-1.2L12 14l-1.2 2.2L9 18l2.2-1.2L12 20z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      {/* layered background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.35),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(56,189,248,0.12),transparent_45%)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030712]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
              TF
            </span>
            <span className="text-sm font-semibold tracking-tight sm:text-base">TaskForge Enterprise</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#stack" className="transition hover:text-white">
              Stack
            </a>
            <a href="#cta" className="transition hover:text-white">
              Launch
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login?demo=admin"
              className="hidden rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-400 sm:inline-block sm:text-sm"
            >
              Live demo
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08] sm:text-sm"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-100 transition hover:bg-indigo-500/20 sm:text-sm"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur">
              <IconSpark />
              Enterprise task &amp; delivery platform
            </div>
            <h1 className="mt-8 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              One surface for projects, tasks, and team velocity.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-400 sm:text-xl">
              Production-style monorepo: premium UI, secure API, Prisma data model, JWT sessions, and a clear path to
              Kanban, analytics, realtime, and AI — without looking like a tutorial toy.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/login?demo=admin"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition hover:opacity-95"
              >
                Open live dashboard
              </Link>
              <Link
                href="/login?demo=member"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur transition hover:bg-white/[0.08]"
              >
                Try as team member
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Seeded demo · No card · API at <code className="rounded bg-white/5 px-1.5 py-0.5 text-indigo-300">localhost:4000</code>
            </p>
          </div>

          {/* stat strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-md sm:mt-24">
            {[
              { k: "Stack", v: "Full‑TS" },
              { k: "Auth", v: "JWT + refresh" },
              { k: "Data", v: "Prisma ORM" },
            ].map((s) => (
              <div key={s.k} className="px-4 py-5 text-center sm:py-6">
                <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{s.v}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">{s.k}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features bento */}
        <section id="features" className="scroll-mt-24 border-t border-white/[0.06] bg-black/20 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Built for serious roadmaps</h2>
              <p className="mt-3 text-slate-400">
                Every block below maps to something you can extend in the repo — not vaporware copy.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className={`group rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-transparent p-6 shadow-lg transition hover:border-indigo-400/30 hover:shadow-indigo-500/5 sm:p-8 ${f.span}`}
                >
                  <div className="h-1 w-10 rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 opacity-80 transition group-hover:w-14" />
                  <h3 className="mt-5 text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stack */}
        <section id="stack" className="scroll-mt-24 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Current stack</h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {stack.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur sm:text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="scroll-mt-24 border-t border-white/[0.06] py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-[#0f172a] to-violet-950/50 px-8 py-14 text-center sm:px-16 sm:py-16">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-600/15 blur-3xl" />
              <h2 className="relative text-2xl font-semibold text-white sm:text-3xl">Ship the next slice in hours, not weeks.</h2>
              <p className="relative mx-auto mt-4 max-w-xl text-slate-400">
                Auth, org-scoped projects, tasks, and a dashboard shell are wired. Add Kanban, sockets, charts, or AI when
                you are ready to flex the next layer.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/login?demo=admin"
                  className="inline-flex rounded-xl bg-white px-8 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-slate-100"
                >
                  Enter app
                </Link>
                <Link href="/signup" className="inline-flex rounded-xl border border-white/25 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] py-10 text-center text-xs text-slate-500">
          <p>TaskForge Enterprise · Portfolio-grade SaaS foundation</p>
          <p className="mt-2">Local dev · Replace URLs after Vercel + Railway deploy</p>
        </footer>
      </main>
    </div>
  );
}
