"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { ensureCandidateProfile } from "@/lib/auth/candidate-profile";

type OnboardingResult =
  | { error: string }
  | { success: true; redirectTo: string }
  | null;

export async function completeOnboarding(
  prevState: OnboardingResult,
  formData: FormData
): Promise<OnboardingResult> {
  const session = await auth();
  if (!session.userId) return { error: "Not authenticated." };

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
    if (!code) {
      return { error: "Please enter a recruiter invite code." };
    }
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: session.userId },
  });

  if (!user) return { error: "User not found. Please sign in again." };

  // Already onboarded — return redirect target without calling redirect()
  if (user.role) {
    const destinations: Record<string, string> = {
      RECRUITER: "/recruiter/dashboard",
      COMPANY: "/company/dashboard",
      ADMIN: "/admin/dashboard",
      CANDIDATE: "/candidate/dashboard",
    };
    return {
      success: true,
      redirectTo: destinations[user.role] ?? "/candidate/dashboard",
    };
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

  const destinations: Record<string, string> = {
    RECRUITER: "/recruiter/dashboard",
    COMPANY: "/company/dashboard",
    CANDIDATE: "/candidate/dashboard",
  };

  return {
    success: true,
    redirectTo: destinations[role] ?? "/candidate/dashboard",
  };
}
