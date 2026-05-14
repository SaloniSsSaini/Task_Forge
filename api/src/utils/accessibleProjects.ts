import { prisma } from "../lib/prisma.js";

export async function getAccessibleProjectIds(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return [];
  const rows = await prisma.project.findMany({
    where: {
      organizationId: user.organizationId,
      OR: [{ adminId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}
