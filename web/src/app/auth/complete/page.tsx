import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/** Post-auth landing: redirect to role dashboard if set, otherwise to onboarding. */
export default async function AuthCompletePage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: session.userId },
    select: { role: true },
  });

  if (user?.role) {
    redirect("/dashboard");
  }

  redirect("/onboarding/role");
}
