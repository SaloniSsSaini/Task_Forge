"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiJson } from "@/lib/api";

export type DashboardProject = {
  id: string;
  title: string;
  description: string | null;
  methodology: string;
  deadline: string | null;
  progress: number;
  _count: { tasks: number; members: number };
};

type Ctx = {
  projects: DashboardProject[];
  loading: boolean;
  error: string | null;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  refreshProjects: () => Promise<void>;
};

const DashboardProjectContext = createContext<Ctx | null>(null);

const LS_KEY = "tf_selected_project";

export function DashboardProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiJson<{ projects: DashboardProject[] }>("/projects");
      setProjects(data.projects);
      setSelectedProjectIdState((prev) => {
        const fromLs = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
        if (fromLs && data.projects.some((p) => p.id === fromLs)) return fromLs;
        if (prev && data.projects.some((p) => p.id === prev)) return prev;
        return data.projects[0]?.id ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  const setSelectedProjectId = useCallback((id: string | null) => {
    setSelectedProjectIdState(id);
    if (typeof window === "undefined") return;
    if (id) localStorage.setItem(LS_KEY, id);
    else localStorage.removeItem(LS_KEY);
  }, []);

  const value = useMemo(
    () => ({
      projects,
      loading,
      error,
      selectedProjectId,
      setSelectedProjectId,
      refreshProjects,
    }),
    [projects, loading, error, selectedProjectId, setSelectedProjectId, refreshProjects],
  );

  return <DashboardProjectContext.Provider value={value}>{children}</DashboardProjectContext.Provider>;
}

export function useDashboardProject(): Ctx {
  const ctx = useContext(DashboardProjectContext);
  if (!ctx) throw new Error("useDashboardProject must be used inside DashboardProjectProvider");
  return ctx;
}
