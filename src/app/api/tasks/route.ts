import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const tasks = await prisma.task.findMany({
    where: { workspaceId },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = TaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { workspaceId } = body;
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const { dueDate, assigneeId, ...rest } = parsed.data;

  const task = await prisma.task.create({
    data: {
      ...rest,
      workspaceId,
      creatorId: session.user.id,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
  });

  if (assigneeId && assigneeId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: "TASK_ASSIGNED",
        title: "New Task Assigned",
        message: `You have been assigned a task: ${task.title}`,
        userId: assigneeId,
        link: `/workspace/${workspaceId}/tasks`,
      },
    });
  }

  return NextResponse.json(task, { status: 201 });
}
