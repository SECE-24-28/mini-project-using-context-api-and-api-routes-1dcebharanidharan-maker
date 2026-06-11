import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get("userId");
  if (!otherUserId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: session.user.id },
      ],
    },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  await prisma.directMessage.updateMany({
    where: { senderId: otherUserId, receiverId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, receiverId } = await req.json();
  if (!content?.trim() || !receiverId) {
    return NextResponse.json({ error: "content and receiverId required" }, { status: 400 });
  }

  const message = await prisma.directMessage.create({
    data: { content, senderId: session.user.id, receiverId },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
