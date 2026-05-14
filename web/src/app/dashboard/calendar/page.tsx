"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardProject } from "@/contexts/dashboard-project-context";
import { apiJson } from "@/lib/api";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const { selectedProjectId } = useDashboardProject();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());

  const load = useCallback(async () => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const data = await apiJson<{ tasks: TaskRow[] }>(`/tasks?projectId=${encodeURIComponent(selectedProjectId)}`);
      setTasks(data.tasks);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const { year, month, cells, taskMap } = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < startPad; i++) {
      const d = new Date(y, m, 1 - (startPad - i));
      cells.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(y, m, d), inMonth: true });
    }
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const last = cells[cells.length - 1]!.date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      cells.push({ date: next, inMonth: false });
    }
    const map = new Map<string, TaskRow[]>();
    for (const t of tasks) {
      const key = (t.dueDate ?? t.createdAt).slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return { year: y, month: m, cells, taskMap: map };
  }, [cursor, tasks]);

  const monthName = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Calendar</h1>
        <p className="text-sm text-slate-400">Month view — tasks use due date, or created date if no due date.</p>
      </div>
      {!selectedProjectId ? (
        <p className="text-slate-500">Select a project in the header.</p>
      ) : loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
            >
              ← Prev
            </button>
            <h2 className="text-lg font-semibold text-white">{monthName}</h2>
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
            >
              Next →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 text-center text-xs font-medium uppercase text-slate-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-slate-950 py-2">
                {d}
              </div>
            ))}
            {cells.map(({ date, inMonth }, i) => {
              const key = dayKey(date);
              const dayTasks = taskMap.get(key) ?? [];
              return (
                <div
                  key={`${key}-${i}`}
                  className={`min-h-[88px] bg-slate-900/80 p-1 text-left ${inMonth ? "" : "opacity-40"}`}
                >
                  <p className="text-[11px] font-semibold text-slate-400">{date.getDate()}</p>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 3).map((t) => (
                      <p key={t.id} className="truncate rounded bg-indigo-500/20 px-1 py-0.5 text-[10px] text-indigo-100" title={t.title}>
                        {t.title}
                      </p>
                    ))}
                    {dayTasks.length > 3 ? (
                      <p className="text-[10px] text-slate-500">+{dayTasks.length - 3}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
