import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const patchMeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
});

router.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = patchMeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!parsed.data.name) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }
  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: { name: parsed.data.name },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, organizationId: true },
  });
  res.json({ user });
});

export const usersRouter = router;
