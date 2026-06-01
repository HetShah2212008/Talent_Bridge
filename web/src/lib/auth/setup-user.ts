import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { parseClerkApiUser } from "@/lib/auth/clerk-profile";
import { ensureCandidateProfile } from "@/lib/auth/candidate-profile";
import { Role } from "@prisma/client";

const NON_CANDIDATE_ROLES: Role[] = [
  Role.RECRUITER,
  Role.ADMIN,
  Role.COMPANY,
];

/** Fallback when webhook has not created the user yet. Public signups → CANDIDATE. */
export async function setupCandidateUser(clerkId: string) {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("No email found on Clerk account");
  }

  const profile = parseClerkApiUser({
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
  });

  const existing = await prisma.user.findUnique({ where: { clerkId } });

  if (existing?.role && NON_CANDIDATE_ROLES.includes(existing.role)) {
    return existing;
  }

  const user = await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: Role.CANDIDATE,
      onboardingCompleted: true,
    },
    update: {
      email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      onboardingCompleted: true,
      ...(!existing?.role ? { role: Role.CANDIDATE } : {}),
    },
  });

  await ensureCandidateProfile(user.id);

  return user;
}

/** Resolve DB user from Clerk session; ensure candidate profile when applicable. */
export async function ensureCurrentUser() {
  const session = await auth();
  if (!session.userId) return null;

  let user = await prisma.user.findUnique({
    where: { clerkId: session.userId },
  });

  if (!user) {
    return setupCandidateUser(session.userId);
  }

  if (user.role && NON_CANDIDATE_ROLES.includes(user.role)) {
    return user;
  }

  if (!user.role) {
    return user;
  }

  await ensureCandidateProfile(user.id);
  return user;
}

export function dashboardPathForRole(role: Role | null | undefined) {
  if (role === Role.RECRUITER) return "/recruiter/dashboard";
  if (role === Role.COMPANY) return "/company/dashboard";
  if (role === Role.ADMIN) return "/admin/dashboard";
  return "/candidate/dashboard";
}
