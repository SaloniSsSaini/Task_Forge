import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const items = await prisma.notification.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  res.json({ notifications: items });
});

router.post("/read-all", requireAuth, async (req: AuthedRequest, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.sub, read: false },
    data: { read: true },
  });
  res.json({ ok: true });
});

router.patch("/:id/read", requireAuth, async (req: AuthedRequest, res) => {
  const id = z.string().min(1).safeParse(req.params.id);
  if (!id.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const n = await prisma.notification.findFirst({
    where: { id: id.data, userId: req.user!.sub },
  });
  if (!n) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await prisma.notification.update({
    where: { id: id.data },
    data: { read: true },
  });
  res.json({ ok: true });
});

export const notificationsRouter = router;
