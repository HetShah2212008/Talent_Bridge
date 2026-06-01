import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DashboardSetupError } from "@/components/auth/DashboardSetupError";
import { redirectToRoleDashboard } from "@/lib/auth/dashboard-redirect";
import { getDbUser } from "@/lib/auth/get-user";

/**
 * Central dashboard entry: Clerk session + Prisma role → role-specific dashboard.
 * If the user exists in DB but has no role yet, send them to onboarding first.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (session.userId) {
    const dbUser = await getDbUser();
    if (dbUser && !dbUser.role) {
      redirect("/onboarding/role");
    }
  }

  const missingDbUser = await redirectToRoleDashboard();
  if (missingDbUser === null) {
    return <DashboardSetupError />;
  }

  return null;
}
