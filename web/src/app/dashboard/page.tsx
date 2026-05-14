"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useDashboardProject } from "@/contexts/dashboard-project-context";
import { apiJson } from "@/lib/api";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string; email: string } | null;
};

const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const;
const METHODOLOGIES = ["KANBAN", "SCRUM", "AGILE", "WATERFALL"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { projects, selectedProjectId, setSelectedProjectId, refreshProjects, loading: loadingProjects, error: projectsError } =
    useDashboardProject();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMethod, setNewMethod] = useState<(typeof METHODOLOGIES)[number]>("KANBAN");
  const [creatingProject, setCreatingProject] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<(typeof PRIORITIES)[number]>("MEDIUM");
  const [creatingTask, setCreatingTask] = useState(false);

  const canManageProjects = useMemo(() => user?.role && user.role !== "MEMBER", [user?.role]);

  const loadTasks = useCallback(async (projectId: string) => {
    setTasksError(null);
    setLoadingTasks(true);
    try {
      const data = await apiJson<{ tasks: TaskRow[] }>(`/tasks?projectId=${encodeURIComponent(projectId)}`);
      setTasks(data.tasks);
    } catch (e) {
      setTasksError(e instanceof Error ? e.message : "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) void loadTasks(selectedProjectId);
    else setTasks([]);
  }, [selectedProjectId, loadTasks]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreatingProject(true);
    try {
      await apiJson("/projects", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          methodology: newMethod,
        }),
      });
      setNewTitle("");
      setNewDesc("");
      await refreshProjects();
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setCreatingProject(false);
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId || !taskTitle.trim()) return;
    setCreatingTask(true);
    try {
      await apiJson("/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId: selectedProjectId,
          title: taskTitle.trim(),
          priority: taskPriority,
        }),
      });
      setTaskTitle("");
      await loadTasks(selectedProjectId);
      await refreshProjects();
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Could not create task");
    } finally {
      setCreatingTask(false);
    }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    if (!selectedProjectId) return;
    try {
      await apiJson(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadTasks(selectedProjectId);
      await refreshProjects();
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Update failed");
    }
  }

  const selected = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="mt-1 text-sm text-slate-400">Projects and task list for the workspace selected in the header.</p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Projects</h2>
            <p className="text-sm text-slate-400">Same org — members and admins see shared projects.</p>
          </div>
          {loadingProjects ? <span className="text-sm text-slate-500">Loading…</span> : null}
        </div>
        {projectsError ? <p className="text-sm text-red-400">{projectsError}</p> : null}

        {canManageProjects ? (
          <form onSubmit={createProject} className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="min-w-[180px] flex-1">
              <label className="text-xs text-slate-400">New project title</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-indigo-500/30 focus:ring-2"
                placeholder="e.g. Mobile app MVP"
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="text-xs text-slate-400">Description (optional)</label>
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-indigo-500/30 focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Method</label>
              <select
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value as (typeof METHODOLOGIES)[number])}
                className="mt-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
              >
                {METHODOLOGIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={creatingProject}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              {creatingProject ? "Creating…" : "Add project"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-500">Members can view projects and tasks; admins/leads can create projects.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProjectId(p.id)}
              className={`rounded-xl border p-4 text-left transition ${
                p.id === selectedProjectId ? "border-indigo-400/60 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <p className="font-medium">{p.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">{p.description ?? "—"}</p>
              <p className="mt-3 text-xs text-slate-500">
                {p.methodology} · {p._count.tasks} tasks · {p.progress}% progress
              </p>
            </button>
          ))}
        </div>
        {!loadingProjects && projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects yet. Seed the DB or create one if you have access.</p>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Tasks</h2>
            {selected ? (
              <p className="text-sm text-slate-400">
                Project: <span className="text-slate-200">{selected.title}</span>
              </p>
            ) : (
              <p className="text-sm text-slate-500">Select a project in the header or grid.</p>
            )}
          </div>
          {loadingTasks ? <span className="text-sm text-slate-500">Loading tasks…</span> : null}
        </div>
        {tasksError ? <p className="text-sm text-red-400">{tasksError}</p> : null}

        {selectedProjectId ? (
          <form onSubmit={createTask} className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="min-w-[200px] flex-1">
              <label className="text-xs text-slate-400">New task</label>
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-indigo-500/30 focus:ring-2"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as (typeof PRIORITIES)[number])}
                className="mt-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              >
                {PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>
                    {pr}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={creatingTask}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              {creatingTask ? "Adding…" : "Add task"}
            </button>
          </form>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium text-slate-100">{t.title}</td>
                  <td className="px-4 py-3 text-slate-400">{t.assignee?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{t.priority}</td>
                  <td className="px-4 py-3">
                    <select
                      value={t.status}
                      onChange={(e) => void updateTaskStatus(t.id, e.target.value)}
                      className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-slate-100"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && selectedProjectId && !loadingTasks ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No tasks in this project yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
