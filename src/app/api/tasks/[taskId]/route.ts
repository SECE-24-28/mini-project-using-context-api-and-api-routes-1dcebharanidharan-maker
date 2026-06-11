import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { taskId } = await params;
  const body = await req.json();

  const { dueDate, ...rest } = body;
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined, updatedAt: new Date() },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { taskId } = await params;

  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ message: "Deleted" });
}
