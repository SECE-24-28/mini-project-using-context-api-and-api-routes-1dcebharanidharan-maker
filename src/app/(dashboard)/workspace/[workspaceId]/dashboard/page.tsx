import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Avatar } from "@/components/ui/misc";
import { Users, MessageSquare, CheckSquare, FolderOpen, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await auth();
  const { workspaceId } = await params;

  const [workspace, recentMessages, tasks, unreadCount] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { _count: { select: { members: true, channels: true, tasks: true, files: true } } },
    }),
    prisma.message.findMany({
      where: { channel: { workspaceId } },
      include: {
        user: { select: { name: true, image: true } },
        channel: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: { workspaceId, assigneeId: session!.user!.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.count({
      where: { userId: session!.user!.id!, isRead: false },
    }),
  ]);

  const taskCounts = await prisma.task.groupBy({
    by: ["status"],
    where: { workspaceId },
    _count: true,
  });

  const stats = [
    { label: "Members", value: workspace?._count.members ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Channels", value: workspace?._count.channels ?? 0, icon: MessageSquare, color: "text-green-500" },
    { label: "Tasks", value: workspace?._count.tasks ?? 0, icon: CheckSquare, color: "text-yellow-500" },
    { label: "Files", value: workspace?._count.files ?? 0, icon: FolderOpen, color: "text-purple-500" },
  ];

  const priorityVariant: Record<string, "default" | "warning" | "danger" | "info"> = {
    LOW: "info", MEDIUM: "warning", HIGH: "danger", URGENT: "danger",
  };
  const statusVariant: Record<string, "default" | "info" | "success"> = {
    TODO: "default", IN_PROGRESS: "info", DONE: "success",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={workspace?.name ?? "Dashboard"}
        subtitle="Overview & analytics"
        unreadNotifications={unreadCount}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`rounded-lg p-2.5 bg-gray-100 dark:bg-gray-700 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Task Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-8">
              {taskCounts.map(({ status, _count }) => (
                <div key={status} className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{_count}</p>
                  <Badge variant={statusVariant[status] ?? "default"} className="mt-1">
                    {status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-sm text-gray-500">No messages yet. Start a conversation!</p>
              ) : (
                recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <Avatar src={msg.user.image} name={msg.user.name || ""} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {msg.user.name}
                        </span>
                        <span className="text-xs text-gray-400">#{msg.channel.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{msg.content}</p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* My Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" /> My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks assigned to you.</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 dark:border-gray-700 p-3"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                      <Badge variant={statusVariant[task.status]}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
