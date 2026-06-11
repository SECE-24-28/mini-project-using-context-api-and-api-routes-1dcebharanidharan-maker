"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/misc";
import {
  Hash, Lock, Plus, Settings, Bell, ChevronDown,
  ChevronRight, MessageSquare, CheckSquare, FolderOpen,
  LayoutDashboard, Users
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface Channel { id: string; name: string; isPrivate: boolean; }
interface Member { id: string; name: string | null; image: string | null; isOnline: boolean; }
interface Workspace { id: string; name: string; image: string | null; }

interface SidebarProps {
  workspace: Workspace;
  channels: Channel[];
  members: Member[];
  workspaces: Workspace[];
}

export function Sidebar({ workspace, channels, members, workspaces }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);

  const navItems = [
    { href: `/workspace/${workspace.id}/dashboard`, icon: LayoutDashboard, label: "Dashboard" },
    { href: `/workspace/${workspace.id}/tasks`, icon: CheckSquare, label: "Tasks" },
    { href: `/workspace/${workspace.id}/files`, icon: FolderOpen, label: "Files" },
    { href: `/workspace/${workspace.id}/settings`, icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col bg-gray-900 text-gray-300">
      {/* Workspace Header */}
      <div className="flex items-center gap-2 border-b border-gray-700 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
          {workspace.name[0].toUpperCase()}
        </div>
        <span className="font-semibold text-white truncate">{workspace.name}</span>
        <ChevronDown className="ml-auto h-4 w-4" />
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Main Nav */}
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-700 hover:text-white",
              pathname === href ? "bg-gray-700 text-white" : "")}>
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        {/* Channels */}
        <div className="pt-2">
          <button onClick={() => setChannelsOpen(!channelsOpen)}
            className="flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300">
            {channelsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Channels
          </button>
          {channelsOpen && (
            <div className="mt-1 space-y-0.5">
              {channels.map((ch) => (
                <Link key={ch.id} href={`/workspace/${workspace.id}/channel/${ch.id}`}
                  className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-gray-700 hover:text-white",
                    pathname.includes(ch.id) ? "bg-gray-700 text-white" : "")}>
                  {ch.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Hash className="h-3.5 w-3.5" />}
                  <span className="truncate">{ch.name}</span>
                </Link>
              ))}
              <Link href={`/workspace/${workspace.id}/settings`}
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-gray-500 hover:text-gray-300">
                <Plus className="h-3.5 w-3.5" />
                Add Channel
              </Link>
            </div>
          )}
        </div>

        {/* Direct Messages */}
        <div className="pt-2">
          <button onClick={() => setDmsOpen(!dmsOpen)}
            className="flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300">
            {dmsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Direct Messages
          </button>
          {dmsOpen && (
            <div className="mt-1 space-y-0.5">
              {members.filter(m => m.id !== session?.user?.id).slice(0, 6).map((member) => (
                <Link key={member.id} href={`/dm/${member.id}`}
                  className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-gray-700 hover:text-white",
                    pathname.includes(`/dm/${member.id}`) ? "bg-gray-700 text-white" : "")}>
                  <Avatar src={member.image} name={member.name || ""} size="sm" isOnline={member.isOnline} />
                  <span className="truncate">{member.name || "Unknown"}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* User Footer */}
      <div className="border-t border-gray-700 p-3">
        <div className="flex items-center gap-2">
          <Avatar src={session?.user?.image} name={session?.user?.name || ""} size="sm" isOnline />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
          <Link href="/profile">
            <Settings className="h-4 w-4 hover:text-white" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
