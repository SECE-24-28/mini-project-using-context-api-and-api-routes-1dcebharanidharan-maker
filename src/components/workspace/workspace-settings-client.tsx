"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Avatar } from "@/components/ui/misc";
import { toast } from "@/components/ui/toast";
import { UserPlus, Hash, Plus } from "lucide-react";

type Role = "ADMIN" | "MANAGER" | "MEMBER";

interface Member {
  id: string;
  userId: string;
  role: Role;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface Props {
  workspace: { id: string; name: string; description: string | null };
  members: Member[];
  currentUserRole: Role;
  currentUserId: string;
}

const roleVariant: Record<Role, "danger" | "warning" | "default"> = {
  ADMIN: "danger", MANAGER: "warning", MEMBER: "default",
};

export function WorkspaceSettingsClient({ workspace, members, currentUserRole }: Props) {
  const router = useRouter();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [channelName, setChannelName] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [addingChannel, setAddingChannel] = useState(false);

  const isAdmin = currentUserRole === "ADMIN";

  const saveSettings = async () => {
    setSaving(true);
    const res = await fetch(`/api/workspaces/${workspace.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setSaving(false);
    if (res.ok) { toast("Settings saved", "success"); router.refresh(); }
    else toast("Failed to save", "error");
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    setInviting(false);
    if (res.ok) { toast("Member invited", "success"); setInviteEmail(""); router.refresh(); }
    else { const e = await res.json(); toast(e.error || "Failed to invite", "error"); }
  };

  const createChannel = async () => {
    if (!channelName.trim()) return;
    setAddingChannel(true);
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: channelName.toLowerCase().replace(/\s+/g, "-"), workspaceId: workspace.id }),
    });
    setAddingChannel(false);
    if (res.ok) { toast("Channel created", "success"); setChannelName(""); router.refresh(); }
    else { const e = await res.json(); toast(e.error || "Failed to create channel", "error"); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {isAdmin && (
        <Card>
          <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Workspace Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <Input value={description} onChange={e => setDescription(e.target.value)} className="mt-1" />
            </div>
            <Button onClick={saveSettings} loading={saving}>Save Changes</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Invite Member</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address" type="email" />
            <Button onClick={inviteMember} loading={inviting}>Invite</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Hash className="h-5 w-5" />Add Channel</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={channelName} onChange={e => setChannelName(e.target.value)} placeholder="channel-name" />
            <Button onClick={createChannel} loading={addingChannel}>
              <Plus className="mr-1 h-4 w-4" /> Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Members ({members.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={m.user.image} name={m.user.name || ""} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{m.user.name}</p>
                  <p className="text-xs text-gray-500">{m.user.email}</p>
                </div>
              </div>
              <Badge variant={roleVariant[m.role]}>{m.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
