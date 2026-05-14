import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { ProjectMethodology } from "@prisma/client";

const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.sub;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });
  if (!user?.organizationId) {
    res.json({ projects: [] });
    return;
  }

  const projects = await prisma.project.findMany({
    where: {
      organizationId: user.organizationId,
      OR: [{ adminId: userId }, { members: { some: { userId } } }],
    },
    select: {
      id: true,
      title: true,
      description: true,
      methodology: true,
      deadline: true,
      progress: true,
      createdAt: true,
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  res.json({ projects });
});

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  methodology: z.nativeEnum(ProjectMethodology).optional(),
  deadline: z.coerce.date().optional(),
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const userId = req.user!.sub;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, role: true },
  });
  if (!user?.organizationId) {
    res.status(400).json({ error: "Join or create a workspace before adding projects." });
    return;
  }
  if (user.role === "MEMBER") {
    res.status(403).json({ error: "Only admins or leads can create projects." });
    return;
  }

  const { title, description, methodology, deadline } = parsed.data;
  const project = await prisma.project.create({
    data: {
      title,
      description,
      methodology: methodology ?? "KANBAN",
      deadline,
      organizationId: user.organizationId,
      adminId: userId,
      members: { create: [{ userId }] },
    },
    select: {
      id: true,
      title: true,
      description: true,
      methodology: true,
      deadline: true,
      progress: true,
      _count: { select: { tasks: true, members: true } },
    },
  });
  res.status(201).json({ project });
});

export const projectsRouter = router;
