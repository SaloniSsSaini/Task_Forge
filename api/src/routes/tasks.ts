import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { getProjectForUser } from "../utils/projectAccess.js";
import { TaskPriority, TaskStatus } from "@prisma/client";

const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const q = z.object({ projectId: z.string().min(1) }).safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: "projectId query required" });
    return;
  }
  const userId = req.user!.sub;
  const project = await getProjectForUser(userId, q.data.projectId);
  if (!project) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const tasks = await prisma.task.findMany({
    where: { projectId: project.id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      createdAt: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ tasks });
});

const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.coerce.date().optional(),
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const userId = req.user!.sub;
  const project = await getProjectForUser(userId, parsed.data.projectId);
  if (!project) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { projectId, title, description, priority, dueDate } = parsed.data;
  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      priority: priority ?? "MEDIUM",
      dueDate,
      assigneeId: userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
  res.status(201).json({ task });
});

const patchSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  title: z.string().min(1).optional(),
});

router.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const id = z.string().min(1).safeParse(req.params.id);
  if (!id.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = req.user!.sub;
  const existing = await prisma.task.findUnique({
    where: { id: id.data },
    select: { projectId: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const project = await getProjectForUser(userId, existing.projectId);
  if (!project) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const task = await prisma.task.update({
    where: { id: id.data },
    data: parsed.data,
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
  res.json({ task });
});

export const tasksRouter = router;
