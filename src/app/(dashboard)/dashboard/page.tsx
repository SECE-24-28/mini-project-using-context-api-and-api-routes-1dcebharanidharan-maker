import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, Hash, CheckSquare } from "lucide-react";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";

export default async function DashboardPage() {
  const session = await auth();
  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: session!.user!.id! } } },
    include: { _count: { select: { members: true, channels: true, tasks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Workspaces</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Select a workspace to get started</p>
          </div>
          <CreateWorkspaceDialog />
        </div>

        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
              <Plus className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No workspaces yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create your first workspace to start collaborating</p>
            <CreateWorkspaceDialog trigger={<Button className="mt-6 bg-indigo-600 hover:bg-indigo-700">Create Workspace</Button>} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <Link key={ws.id} href={`/workspace/${ws.id}/dashboard`}>
                <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg">
                        {ws.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{ws.name}</h3>
                        {ws.description && <p className="text-xs text-gray-500 truncate">{ws.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{ws._count.members}</span>
                      <span className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" />{ws._count.channels}</span>
                      <span className="flex items-center gap-1"><CheckSquare className="h-3.5 w-3.5" />{ws._count.tasks}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
