"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { ensureCandidateProfile } from "@/lib/auth/candidate-profile";

export async function completeOnboarding(
  prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const role = formData.get("role") as string;
  const code = ((formData.get("code") as string) ?? "").trim();

  if (!["CANDIDATE", "COMPANY", "RECRUITER"].includes(role)) {
    return { error: "Please select a role to continue." };
  }

  if (role === "COMPANY") {
    const validCode = process.env.COMPANY_REGISTRATION_CODE ?? "";
    if (!validCode || code !== validCode) {
      return { error: "Invalid company registration code." };
    }
  }

  if (role === "RECRUITER") {
    // No standalone validation function exists in lib/recruiter-invite.ts —
    // codes are validated at signup time via the recruiterInvite table.
    // Here we just ensure a code was provided; full validation happens on signup.
    if (!code) {
      return { error: "Please enter a recruiter invite code." };
    }
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: session.userId },
  });

  if (!user) redirect("/sign-in");

  if (user.role) {
    if (user.role === Role.RECRUITER) redirect("/recruiter/dashboard");
    if (user.role === Role.COMPANY) redirect("/company/dashboard");
    if (user.role === Role.ADMIN) redirect("/admin/dashboard");
    redirect("/candidate/dashboard");
  }

  const updated = await prisma.user.update({
    where: { clerkId: session.userId },
    data: {
      role: role as Role,
      onboardingCompleted: true,
    },
  });

  if (updated.role === Role.CANDIDATE) {
    await ensureCandidateProfile(updated.id);
  }

  if (updated.role === Role.RECRUITER) redirect("/recruiter/dashboard");
  if (updated.role === Role.COMPANY) redirect("/company/dashboard");
  redirect("/candidate/dashboard");
}
