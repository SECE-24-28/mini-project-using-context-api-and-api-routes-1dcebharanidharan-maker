import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "If that email exists, a reset link was sent." });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({ data: { token, userId: user.id, expires } });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your TeamSync password",
      html: `<p>Click <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${token}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });

    return NextResponse.json({ message: "If that email exists, a reset link was sent." });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
