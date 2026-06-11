import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const files = await prisma.file.findMany({
    where: { workspaceId },
    include: { uploader: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(files);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const workspaceId = formData.get("workspaceId") as string;
  const taskId = formData.get("taskId") as string | null;

  if (!file || !workspaceId) return NextResponse.json({ error: "file and workspaceId required" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: "auto", folder: "teamsync" }, (err, result) => {
      if (err || !result) reject(err);
      else resolve(result as any);
    }).end(buffer);
  });

  const saved = await prisma.file.create({
    data: {
      name: file.name,
      url: result.secure_url,
      type: file.type,
      size: file.size,
      workspaceId,
      uploaderId: session.user.id,
      taskId: taskId || null,
    },
    include: { uploader: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(saved, { status: 201 });
}
