"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { apiJson } from "@/lib/api";

type Overview = {
  totalProjects: number;
  totalTasks: number;
  overdueTasks: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
};

const COLORS = ["#6366f1", "#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#fb7185"];

export default function AnalyticsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const o = await apiJson<Overview>("/analytics/overview");
        if (!cancelled) setData(o);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusRows = Object.entries(data?.byStatus ?? {}).map(([name, value]) => ({ name: name.replace("_", " "), value }));
  const priorityRows = Object.entries(data?.byPriority ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="text-sm text-slate-400">Aggregates across all projects you can access in your workspace.</p>
      </div>
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      {!data ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase text-slate-500">Projects</p>
              <p className="mt-1 text-3xl font-semibold text-white">{data.totalProjects}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase text-slate-500">Tasks</p>
              <p className="mt-1 text-3xl font-semibold text-white">{data.totalTasks}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase text-slate-500">Overdue (not done)</p>
              <p className="mt-1 text-3xl font-semibold text-amber-300">{data.overdueTasks}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <h2 className="mb-4 text-sm font-semibold text-slate-300">Tasks by status</h2>
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusRows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <h2 className="mb-4 text-sm font-semibold text-slate-300">Tasks by priority</h2>
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityRows} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                      {priorityRows.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
