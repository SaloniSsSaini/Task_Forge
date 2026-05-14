import { PrismaClient, UserRole, ProjectMethodology, TaskPriority, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAILS = ["admin@demo.com", "member@demo.com"] as const;

async function main() {
  await prisma.notification.deleteMany({
    where: { user: { email: { in: [...DEMO_EMAILS] } } },
  });

  await prisma.organization.deleteMany({
    where: { name: "Demo Workspace" },
  });

  await prisma.user.deleteMany({
    where: { email: { in: [...DEMO_EMAILS] } },
  });

  const adminHash = await bcrypt.hash("Admin123", 12);
  const memberHash = await bcrypt.hash("Member123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@demo.com",
      passwordHash: adminHash,
      role: UserRole.PROJECT_ADMIN,
    },
  });

  const member = await prisma.user.create({
    data: {
      name: "Demo Member",
      email: "member@demo.com",
      passwordHash: memberHash,
      role: UserRole.MEMBER,
    },
  });

  const org = await prisma.organization.create({
    data: {
      name: "Demo Workspace",
      ownerId: admin.id,
      teams: [{ id: "eng", name: "Engineering" }],
    },
  });

  await prisma.user.update({
    where: { id: admin.id },
    data: { organizationId: org.id },
  });
  await prisma.user.update({
    where: { id: member.id },
    data: { organizationId: org.id },
  });

  const project = await prisma.project.create({
    data: {
      title: "Website Relaunch",
      description: "End-to-end redesign and analytics rollout.",
      methodology: ProjectMethodology.SCRUM,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      progress: 35,
      organizationId: org.id,
      adminId: admin.id,
      members: {
        create: [{ userId: admin.id }, { userId: member.id }],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Define sprint goals",
        description: "Align backlog with stakeholder priorities.",
        priority: TaskPriority.HIGH,
        status: TaskStatus.COMPLETED,
        dueDate: new Date(),
        projectId: project.id,
        assigneeId: admin.id,
      },
      {
        title: "Implement Kanban board",
        description: "DnD columns with optimistic updates.",
        priority: TaskPriority.CRITICAL,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assigneeId: member.id,
      },
      {
        title: "Analytics dashboard",
        description: "Burn-down and velocity using Recharts.",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assigneeId: member.id,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: member.id, type: "task_assigned", message: "You were assigned: Implement Kanban board", read: false },
      { userId: admin.id, type: "mention", message: "@admin please review sprint backlog", read: true },
    ],
  });

  console.log("Seed complete: admin@demo.com / Admin123, member@demo.com / Member123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
