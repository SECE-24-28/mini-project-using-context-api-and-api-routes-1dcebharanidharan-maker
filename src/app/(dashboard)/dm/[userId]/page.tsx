"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";
import { toast } from "@/components/ui/toast";

interface DM {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: string; name: string | null; image: string | null };
}

interface UserInfo {
  id: string;
  name: string | null;
  image: string | null;
  isOnline: boolean;
  bio?: string | null;
}

export default function DMPage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<DM[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<UserInfo | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`/api/dm?userId=${userId}`).then(r => r.json()),
      fetch(`/api/users/${userId}`).then(r => r.json()),
    ]).then(([msgs, user]) => {
      setMessages(msgs);
      setOtherUser(user);
      scrollToBottom();
    });
  }, [userId, scrollToBottom]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const socket = io({ path: "/api/socket" });
    socketRef.current = socket;
    socket.emit("join-dm", session.user.id);

    socket.on("new-dm", (dm: DM) => {
      if (dm.sender.id === userId) {
        setMessages(prev => [...prev, dm]);
        scrollToBottom();
      }
    });

    return () => { socket.disconnect(); };
  }, [session?.user?.id, userId, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const res = await fetch("/api/dm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input, receiverId: userId }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      socketRef.current?.emit("send-dm", { ...msg, receiverId: userId });
      setInput("");
      scrollToBottom();
    } else {
      toast("Failed to send message", "error");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        {otherUser && (
          <>
            <Avatar src={otherUser.image} name={otherUser.name || ""} size="md" isOnline={otherUser.isOnline} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{otherUser.name}</p>
              <p className="text-xs text-gray-400">{otherUser.isOnline ? "Online" : "Offline"}</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.senderId === session?.user?.id;
          return (
            <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
              <Avatar
                src={isOwn ? session?.user?.image : otherUser?.image}
                name={isOwn ? session?.user?.name || "" : otherUser?.name || ""}
                size="sm"
              />
              <div className={`max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-2 text-sm ${
                  isOwn
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
                <span className="mt-1 text-xs text-gray-400">
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  {isOwn && (
                    <span className="ml-1">{msg.isRead ? "✓✓" : "✓"}</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Message ${otherUser?.name || "..."}`}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
