"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiJson } from "@/lib/api";

type Row = { id: string; type: string; message: string; read: boolean; createdAt: string };

export default function NotificationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<{ notifications: Row[] }>("/notifications");
      setRows(data.notifications);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    void load();
  }

  async function markAll() {
    await apiFetch("/notifications/read-all", { method: "POST" });
    void load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Notifications</h1>
          <p className="text-sm text-slate-400">From the API (seed includes sample rows).</p>
        </div>
        <button
          type="button"
          onClick={() => void markAll()}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
        >
          Mark all read
        </button>
      </div>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500">No notifications.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((n) => (
            <li
              key={n.id}
              className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
                n.read ? "border-white/5 bg-white/[0.02]" : "border-indigo-500/20 bg-indigo-500/5"
              }`}
            >
              <div>
                <p className="text-xs uppercase text-slate-500">{n.type}</p>
                <p className="text-sm text-slate-100">{n.message}</p>
                <p className="mt-1 text-xs text-slate-600">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read ? (
                <button
                  type="button"
                  onClick={() => void markRead(n.id)}
                  className="shrink-0 text-xs text-indigo-300 hover:text-indigo-200"
                >
                  Mark read
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
