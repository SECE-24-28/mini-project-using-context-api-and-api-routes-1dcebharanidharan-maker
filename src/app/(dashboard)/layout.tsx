import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Update user online status
  await prisma.user.update({
    where: { id: session.user.id },
    data: { isOnline: true },
  });

  return <>{children}</>;
}
