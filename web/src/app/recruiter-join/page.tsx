import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { RecruiterJoinForm } from "@/components/recruiter/RecruiterJoinForm";
import { ButtonLink } from "@/components/ui/button-link";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { dashboardPathForRole } from "@/lib/auth/setup-user";

export default async function RecruiterJoinPage() {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in?redirect_url=/recruiter-join");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: session.userId },
  });

  if (user?.role === Role.RECRUITER) {
    redirect("/recruiter/dashboard");
  }
  if (user?.role === Role.COMPANY || user?.role === Role.ADMIN) {
    redirect(dashboardPathForRole(user.role));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-bold text-xl">
            <Briefcase className="h-6 w-6 text-primary" />
            TalentBridge
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Join as recruiter</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with Clerk first, then enter the invite code from your company.
          </p>
        </div>

        <div className="border rounded-xl p-6 bg-card shadow-sm">
          <RecruiterJoinForm />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Wrong account?{" "}
          <Link href="/sign-in?switch=1" className="text-primary underline">
            Switch account
          </Link>
          {" · "}
          <Link href="/sign-up?switch=1" className="text-primary underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
