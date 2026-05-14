import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { getAccessibleProjectIds } from "../utils/accessibleProjects.js";

const router = Router();

router.get("/overview", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.sub;
  const ids = await getAccessibleProjectIds(userId);
  if (ids.length === 0) {
    res.json({
      totalProjects: 0,
      totalTasks: 0,
      overdueTasks: 0,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    });
    return;
  }

  const totalProjects = ids.length;
  const byStatus = await prisma.task.groupBy({
    by: ["status"],
    where: { projectId: { in: ids } },
    _count: { _all: true },
  });
  const byPriority = await prisma.task.groupBy({
    by: ["priority"],
    where: { projectId: { in: ids } },
    _count: { _all: true },
  });
  const totalTasks = await prisma.task.count({ where: { projectId: { in: ids } } });
  const now = new Date();
  const overdueTasks = await prisma.task.count({
    where: {
      projectId: { in: ids },
      status: { not: "COMPLETED" },
      dueDate: { lt: now },
    },
  });

  res.json({
    totalProjects,
    totalTasks,
    overdueTasks,
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])),
    byPriority: Object.fromEntries(byPriority.map((r) => [r.priority, r._count._all])),
  });
});

export const analyticsRouter = router;
