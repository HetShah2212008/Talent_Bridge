import { DashboardSetupError } from "@/components/auth/DashboardSetupError";
import { redirectToRoleDashboard } from "@/lib/auth/dashboard-redirect";

/**
 * Central dashboard entry: Clerk session + Prisma role → role-specific dashboard.
 */
export default async function DashboardPage() {
  const missingDbUser = await redirectToRoleDashboard();
  if (missingDbUser === null) {
    return <DashboardSetupError />;
  }

  return null;
}
