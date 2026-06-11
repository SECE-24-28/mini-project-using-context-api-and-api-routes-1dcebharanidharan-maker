import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { WorkspaceSettingsClient } from "@/components/workspace/workspace-settings-client";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { workspaceId } = await params;

  const [workspace, member] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
          orderBy: { joinedAt: "asc" },
        },
      },
    }),
    prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
    }),
  ]);

  if (!workspace || !member) redirect("/dashboard");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Settings" subtitle={workspace.name} />
      <div className="flex-1 overflow-y-auto p-6">
        <WorkspaceSettingsClient
          workspace={{ id: workspace.id, name: workspace.name, description: workspace.description }}
          members={workspace.members.map(m => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            user: m.user,
          }))}
          currentUserRole={member.role}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
