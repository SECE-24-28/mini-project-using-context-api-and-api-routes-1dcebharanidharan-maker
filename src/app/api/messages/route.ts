import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: { channelId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      reactions: true,
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, channelId, parentId } = await req.json();
  if (!content?.trim() || !channelId) {
    return NextResponse.json({ error: "content and channelId required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { content, channelId, userId: session.user.id, parentId: parentId || null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      reactions: true,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
