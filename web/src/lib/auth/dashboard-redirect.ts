import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { dashboardPathForRole, ensureCurrentUser } from "@/lib/auth/setup-user";
import { getDbUser } from "@/lib/auth/get-user";

/** Resolve role dashboard path from Prisma (never Clerk metadata). */
export async function resolveDashboardPath(): Promise<string | null> {
  const session = await auth();
  if (!session.userId) return null;

  let user = await getDbUser();
  if (!user) {
    user = await ensureCurrentUser();
  }

  if (!user) return null;
  return dashboardPathForRole(user.role);
}

/** Ensures DB user exists, then redirects to the role-specific dashboard. */
export async function redirectToRoleDashboard(): Promise<null> {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }

  const user = await ensureCurrentUser();
  if (!user) {
    return null;
  }

  redirect(dashboardPathForRole(user.role));
}
