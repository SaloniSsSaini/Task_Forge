"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

const DEMO_ADMIN = { email: "admin@demo.com", password: "Admin123" };
const DEMO_MEMBER = { email: "member@demo.com", password: "Member123" };

function LoginForm() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || user) return;
    const demo = searchParams.get("demo");
    if (demo !== "admin" && demo !== "member") return;
    const creds = demo === "admin" ? DEMO_ADMIN : DEMO_MEMBER;
    let cancelled = false;
    (async () => {
      setError(null);
      setSubmitting(true);
      try {
        await login(creds.email, creds.password);
        if (!cancelled) router.replace("/dashboard");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Demo login failed");
        }
      } finally {
        if (!cancelled) setSubmitting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, user, searchParams, login, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function quickDemo(which: "admin" | "member") {
    setError(null);
    setSubmitting(true);
    const creds = which === "admin" ? DEMO_ADMIN : DEMO_MEMBER;
    try {
      await login(creds.email, creds.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <p className="text-sm text-slate-400">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">TaskForge Enterprise</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">One tap demo, or use the form below.</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void quickDemo("admin")}
            className="rounded-xl border border-indigo-400/40 bg-indigo-500/20 py-2.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/30 disabled:opacity-50"
          >
            Demo Admin
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void quickDemo("member")}
            className="rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
          >
            Demo Member
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          Direct link:{" "}
          <Link href="/login?demo=admin" className="text-indigo-300 hover:underline">
            ?demo=admin
          </Link>
          {" · "}
          <Link href="/login?demo=member" className="text-indigo-300 hover:underline">
            ?demo=member
          </Link>
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-indigo-500/40 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-indigo-500/40 focus:ring-2"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
          <p>
            <span className="font-medium text-white">Admin:</span> admin@demo.com / Admin123
          </p>
          <p>
            <span className="font-medium text-white">Member:</span> member@demo.com / Member123
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          No account?{" "}
          <Link href="/signup" className="font-medium text-indigo-300 hover:text-indigo-200">
            Create one
          </Link>
        </p>
        <Link href="/" className="mt-4 inline-flex text-sm text-indigo-300 hover:text-indigo-200">
          ← Back to landing
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
