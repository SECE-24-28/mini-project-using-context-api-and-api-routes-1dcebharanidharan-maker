import { NextRequest, NextResponse } from "next/server";
import { Server as SocketServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var io: SocketServer | undefined;
}

export async function GET(req: NextRequest) {
  if (global.io) {
    return NextResponse.json({ status: "already running" });
  }

  // Socket.IO with Next.js App Router requires a custom server
  // See /server/socket.ts for the standalone server approach
  return NextResponse.json({ status: "use custom server" });
}
