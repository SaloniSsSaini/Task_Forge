import { prisma } from "../lib/prisma.js";

export async function getProjectForUser(userId: string, projectId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ adminId: userId }, { members: { some: { userId } } }],
    },
    select: {
      id: true,
      organizationId: true,
      adminId: true,
    },
  });
}
