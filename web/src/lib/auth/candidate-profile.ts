import prisma from "@/lib/prisma";
import { Prisma, type CandidateProfile } from "@prisma/client";

/** Ensures a CandidateProfile row exists for CANDIDATE users. */
export async function ensureCandidateProfile(userId: string): Promise<CandidateProfile> {
  const existing = await prisma.candidateProfile.findFirst({
    where: { userId },
  });
  if (existing) return existing;

  try {
    return await prisma.candidateProfile.create({
      data: { userId },
    });
  } catch (error) {
    // Handle signup/dashboard race: another request created the row first.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const profile = await prisma.candidateProfile.findFirst({
        where: { userId },
      });
      if (profile) return profile;
    }
    throw error;
  }
}

/** Safe read — returns null if missing (UI should use optional chaining). */
export async function getCandidateProfile(
  userId: string
): Promise<CandidateProfile | null> {
  return prisma.candidateProfile.findUnique({
    where: { userId },
  });
}
