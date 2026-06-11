import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketServer(server, {
    path: "/api/socket",
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    socket.on("join-channel", (channelId: string) => {
      socket.join(`channel:${channelId}`);
    });

    socket.on("leave-channel", (channelId: string) => {
      socket.leave(`channel:${channelId}`);
    });

    socket.on("typing", ({ channelId, userId, name }: { channelId: string; userId: string; name: string }) => {
      socket.to(`channel:${channelId}`).emit("typing", { userId, name });
    });

    socket.on("send-message", (message) => {
      io.to(`channel:${message.channelId}`).emit("new-message", message);
    });

    socket.on("update-message", (message) => {
      io.to(`channel:${message.channelId}`).emit("message-updated", message);
    });

    socket.on("delete-message", ({ channelId, messageId }: { channelId: string; messageId: string }) => {
      io.to(`channel:${channelId}`).emit("message-deleted", messageId);
    });

    socket.on("join-dm", (userId: string) => {
      socket.join(`dm:${userId}`);
    });

    socket.on("send-dm", (dm) => {
      io.to(`dm:${dm.receiverId}`).emit("new-dm", dm);
    });

    socket.on("user-online", (userId: string) => {
      socket.broadcast.emit("user-status", { userId, isOnline: true });
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("user-status", { userId: socket.id, isOnline: false });
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> TeamSync ready on http://localhost:${PORT}`);
  });
});
