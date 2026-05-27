import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/auth/get-user";
import { LandingNavbar } from "@/components/landing/Navbar";

export async function LandingNavbarShell() {
  const session = await auth();
  let navSession: { email: string; role: import("@prisma/client").Role | null } | null =
    null;

  if (session.userId) {
    const dbUser = await getDbUser();
    if (dbUser) {
      navSession = { email: dbUser.email, role: dbUser.role };
    }
  }

  return <LandingNavbar session={navSession} />;
}
