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
    const invite = await prisma.recruiterInvite.findUnique({
      where: { code },
    });
    if (!invite) {
      return { error: "Invalid recruiter invite code." };
    }
    if (invite.isUsed) {
      return { error: "This invite code has already been used." };
    }
  }

  const { userId, sessionClaims } = session;
  const email = (sessionClaims?.email as string) ?? "";
  const fullName = ((sessionClaims?.fullName ?? sessionClaims?.name ?? "") as string);
  const [firstName = "", ...rest] = fullName.trim().split(" ");
  const lastName = rest.join(" ");

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      email,
      firstName,
      lastName,
      role: null,
      onboardingCompleted: false,
    },
  });

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
    where: { clerkId: userId },
    data: {
      role: role as Role,
      onboardingCompleted: true,
    },
  });

  if (updated.role === Role.CANDIDATE) {
    await ensureCandidateProfile(updated.id);
  }

  if (updated.role === Role.RECRUITER) {
    const invite = await prisma.recruiterInvite.findUnique({
      where: { code },
    });
    if (invite) {
      await prisma.user.update({
        where: { id: updated.id },
        data: { companyId: invite.companyId },
      });
      await prisma.recruiterInvite.update({
        where: { code },
        data: { isUsed: true },
      });
    }
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
