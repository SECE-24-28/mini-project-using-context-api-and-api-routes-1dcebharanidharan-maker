import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { workspaceId } = await params;

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!member) redirect("/dashboard");

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      channels: { orderBy: { createdAt: "asc" } },
      members: {
        include: { user: { select: { id: true, name: true, image: true, isOnline: true } } },
      },
    },
  });

  if (!workspace) redirect("/dashboard");

  const userWorkspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    select: { id: true, name: true, image: true },
  });

  const members = workspace.members.map(m => ({
    id: m.user.id,
    name: m.user.name,
    image: m.user.image,
    isOnline: m.user.isOnline,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar
        workspace={{ id: workspace.id, name: workspace.name, image: workspace.image }}
        channels={workspace.channels}
        members={members}
        workspaces={userWorkspaces}
      />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
