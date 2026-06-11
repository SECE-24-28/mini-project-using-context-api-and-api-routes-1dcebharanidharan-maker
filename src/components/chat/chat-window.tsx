"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, SmilePlus, Pencil, Trash2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/toast";
import { io, Socket } from "socket.io-client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  user: { id: string; name: string | null; image: string | null };
  reactions: { emoji: string; userId: string }[];
  replies?: Message[];
  parentId?: string | null;
}

interface ChatProps {
  channelId: string;
  channelName: string;
  workspaceId: string;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

export function ChatWindow({ channelId, channelName, workspaceId }: ChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadParent, setThreadParent] = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    fetch(`/api/messages?channelId=${channelId}`)
      .then(r => r.json())
      .then(data => { setMessages(data); setLoading(false); scrollToBottom(); });
  }, [channelId]);

  useEffect(() => {
    const socket = io({ path: "/api/socket" });
    socketRef.current = socket;
    socket.emit("join-channel", channelId);

    socket.on("new-message", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    socket.on("message-updated", (updated: Message) => {
      setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
    });

    socket.on("message-deleted", (id: string) => {
      setMessages(prev => prev.filter(m => m.id !== id));
    });

    socket.on("typing", ({ userId, name }: { userId: string; name: string }) => {
      if (userId !== session?.user?.id) {
        setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name]);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTypingUsers([]), 2000);
      }
    });

    return () => { socket.disconnect(); };
  }, [channelId, session?.user?.id]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input, channelId, parentId: threadParent?.id }),
    });
    if (res.ok) {
      setInput("");
      setThreadParent(null);
    } else {
      toast("Failed to send message", "error");
    }
  };

  const handleTyping = () => {
    socketRef.current?.emit("typing", { channelId, userId: session?.user?.id, name: session?.user?.name });
  };

  const deleteMessage = async (id: string) => {
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    setEditingId(null);
  };

  const addReaction = async (messageId: string, emoji: string) => {
    await fetch(`/api/messages/${messageId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
  };

  const topLevelMessages = messages.filter(m => !m.parentId);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white"># {channelName}</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {topLevelMessages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  currentUserId={session?.user?.id}
                  editingId={editingId}
                  editContent={editContent}
                  setEditingId={setEditingId}
                  setEditContent={setEditContent}
                  onDelete={deleteMessage}
                  onSaveEdit={saveEdit}
                  onReact={addReaction}
                  onThread={setThreadParent}
                  replies={messages.filter(m => m.parentId === msg.id)}
                />
              ))}
              {typingUsers.length > 0 && (
                <p className="text-sm text-gray-500 italic">
                  {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </p>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {threadParent && (
            <div className="border-t border-indigo-200 bg-indigo-50 px-4 py-2 dark:border-indigo-800 dark:bg-indigo-950/30">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Replying to <strong>{threadParent.user.name}</strong>: {threadParent.content.slice(0, 50)}
                <button onClick={() => setThreadParent(null)} className="ml-2 text-gray-500 hover:text-gray-700">✕</button>
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                onInput={handleTyping}
                placeholder={`Message #${channelName}`}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageItem({ msg, currentUserId, editingId, editContent, setEditingId, setEditContent, onDelete, onSaveEdit, onReact, onThread, replies }: {
  msg: Message;
  currentUserId?: string;
  editingId: string | null;
  editContent: string;
  setEditingId: (id: string | null) => void;
  setEditContent: (c: string) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onThread: (msg: Message) => void;
  replies: Message[];
}) {
  const [showEmojis, setShowEmojis] = useState(false);
  const isOwn = msg.user.id === currentUserId;

  const groupedReactions = msg.reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="group flex gap-3">
      <Avatar src={msg.user.image} name={msg.user.name || ""} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900 dark:text-white text-sm">{msg.user.name}</span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
          </span>
          {msg.editedAt && <span className="text-xs text-gray-400">(edited)</span>}
        </div>

        {editingId === msg.id ? (
          <div className="mt-1 flex gap-2">
            <Input value={editContent} onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(msg.id); if (e.key === "Escape") setEditingId(null); }}
              className="flex-1 text-sm" />
            <Button size="sm" onClick={() => onSaveEdit(msg.id)}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{msg.content}</p>
        )}

        {Object.keys(groupedReactions).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button key={emoji} onClick={() => onReact(msg.id, emoji)}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                {emoji} {count}
              </button>
            ))}
          </div>
        )}

        {replies.length > 0 && (
          <button onClick={() => onThread(msg)} className="mt-1 text-xs text-indigo-500 hover:underline">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      <div className="hidden group-hover:flex items-start gap-1 flex-shrink-0">
        <div className="relative">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowEmojis(!showEmojis)}>
            <SmilePlus className="h-3.5 w-3.5" />
          </Button>
          {showEmojis && (
            <div className="absolute right-0 top-8 z-10 flex gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-800">
              {EMOJIS.map(e => (
                <button key={e} className="text-lg hover:scale-125 transition-transform"
                  onClick={() => { onReact(msg.id, e); setShowEmojis(false); }}>{e}</button>
              ))}
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onThread(msg)}>
          <MessageSquare className="h-3.5 w-3.5" />
        </Button>
        {isOwn && (
          <>
            <Button variant="ghost" size="icon" className="h-7 w-7"
              onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
              onClick={() => onDelete(msg.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
