"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useState } from "react";
import { useDashboardProject } from "@/contexts/dashboard-project-context";
import { apiJson } from "@/lib/api";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority: string;
};

const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const;

function Column({ status, children }: { status: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[280px] flex-1 flex-col rounded-xl border bg-slate-900/50 p-3 transition ${
        isOver ? "border-indigo-400/60 ring-1 ring-indigo-400/30" : "border-white/10"
      }`}
    >
      <h3 className="mb-3 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {status.replace("_", " ")}
      </h3>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

function TaskCard({ task }: { task: TaskRow }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 active:cursor-grabbing"
    >
      <p className="font-medium">{task.title}</p>
      <p className="mt-1 text-xs text-slate-500">{task.priority}</p>
    </div>
  );
}

export default function KanbanPage() {
  const { selectedProjectId, refreshProjects } = useDashboardProject();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const data = await apiJson<{ tasks: TaskRow[] }>(`/tasks?projectId=${encodeURIComponent(selectedProjectId)}`);
      setTasks(data.tasks);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function onDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over || !selectedProjectId) return;
    const taskId = String(active.id);
    let targetStatus = String(over.id);
    if (!(STATUSES as readonly string[]).includes(targetStatus)) {
      const hit = tasks.find((t) => t.id === over.id);
      if (hit) targetStatus = hit.status;
      else return;
    }
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;
    try {
      await apiJson(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: targetStatus }),
      });
      await load();
      await refreshProjects();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Kanban</h1>
        <p className="text-sm text-slate-400">Drag cards between columns to update status.</p>
      </div>
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      {!selectedProjectId ? (
        <p className="text-slate-500">Select a project in the header.</p>
      ) : loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <div className="flex flex-col gap-4 lg:flex-row">
            {STATUSES.map((status) => (
              <Column key={status} status={status}>
                {tasks
                  .filter((t) => t.status === status)
                  .map((t) => (
                    <TaskCard key={t.id} task={t} />
                  ))}
              </Column>
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
