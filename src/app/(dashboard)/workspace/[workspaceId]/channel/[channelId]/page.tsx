import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ChatWindow } from "@/components/chat/chat-window";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ workspaceId: string; channelId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { workspaceId, channelId } = await params;

  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel || channel.workspaceId !== workspaceId) redirect(`/workspace/${workspaceId}/dashboard`);

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={`# ${channel.name}`}
        subtitle={channel.description ?? undefined}
        unreadNotifications={unreadCount}
      />
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          channelId={channel.id}
          channelName={channel.name}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  );
}
