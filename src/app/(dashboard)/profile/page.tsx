"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/misc";
import { toast } from "@/components/ui/toast";
import { LogOut, Save } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      fetch(`/api/users/${session.user.id}`)
        .then(r => r.json())
        .then(u => setBio(u.bio || ""));
    }
  }, [session]);

  const saveProfile = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    const res = await fetch(`/api/users/${session.user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio }),
    });
    setSaving(false);
    if (res.ok) {
      await update({ name });
      toast("Profile updated", "success");
      router.refresh();
    } else {
      toast("Failed to update profile", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <Card>
          <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar src={session?.user?.image} name={session?.user?.name || ""} size="lg" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{session?.user?.name}</p>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <Input value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell your team about yourself" className="mt-1" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button onClick={saveProfile} loading={saving}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
              <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
