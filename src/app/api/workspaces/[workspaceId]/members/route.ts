import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspaceId } = await params;
  const { email, role = "MEMBER" } = await req.json();

  const callerMember = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!callerMember || !["ADMIN", "MANAGER"].includes(callerMember.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: invitee.id, workspaceId } },
  });
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  const member = await prisma.workspaceMember.create({
    data: { userId: invitee.id, workspaceId, role },
    include: { user: { select: { id: true, name: true, image: true, email: true } } },
  });

  await prisma.notification.create({
    data: {
      type: "WORKSPACE_INVITE",
      title: "Workspace Invitation",
      message: `You've been added to a workspace`,
      userId: invitee.id,
      link: `/workspace/${workspaceId}`,
    },
  });

  return NextResponse.json(member, { status: 201 });
}
