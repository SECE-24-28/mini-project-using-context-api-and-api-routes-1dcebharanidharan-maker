import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { members: true, channels: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(workspaces);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = WorkspaceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { name, description } = parsed.data;
  const baseSlug = slugify(name);

  const existing = await prisma.workspace.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      description,
      ownerId: session.user.id,
      members: { create: { userId: session.user.id, role: "ADMIN" } },
      channels: { create: { name: "general", description: "General channel for the workspace" } },
    },
    include: { _count: { select: { members: true, channels: true } } },
  });

  return NextResponse.json(workspace, { status: 201 });
}
