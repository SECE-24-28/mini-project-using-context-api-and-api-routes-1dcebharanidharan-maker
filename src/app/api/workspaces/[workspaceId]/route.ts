import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceId } = await params;

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      channels: { orderBy: { createdAt: "asc" } },
      members: { include: { user: { select: { id: true, name: true, image: true, isOnline: true } } } },
      _count: { select: { members: true, channels: true, tasks: true } },
    },
  });

  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(workspace);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceId } = await params;
  const body = await req.json();

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!member || member.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const workspace = await prisma.workspace.update({ where: { id: workspaceId }, data: body });
  return NextResponse.json(workspace);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.workspace.delete({ where: { id: workspaceId } });
  return NextResponse.json({ message: "Deleted" });
}
