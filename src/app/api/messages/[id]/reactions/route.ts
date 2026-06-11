import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { emoji } = await req.json();

  const existing = await prisma.messageReaction.findUnique({
    where: { userId_messageId_emoji: { userId: session.user.id, messageId: id, emoji } },
  });

  if (existing) {
    await prisma.messageReaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ removed: true });
  }

  const reaction = await prisma.messageReaction.create({
    data: { emoji, userId: session.user.id, messageId: id },
  });

  return NextResponse.json(reaction, { status: 201 });
}
