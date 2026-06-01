"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
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

  const { userId, sessionClaims } = session;

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

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
  const firstName = clerkUser?.firstName ?? "";
  const lastName = clerkUser?.lastName ?? "";

  // Find by clerkId first, then fall back to email to avoid unique constraint crash
  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user && email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Row exists with same email but different clerkId — sync it
      user = await prisma.user.update({
        where: { email },
        data: { clerkId: userId },
      });
    }
  }
  if (!user) {
    // No row at all — webhook hasn't fired yet, create it now
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        firstName,
        lastName,
        role: null,
        onboardingCompleted: false,
      },
    });
  }

  // Already onboarded — just redirect, do not overwrite role
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

  // Set the role
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
