import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { withDatabase } from "@/lib/db-handler";

const CODE_PREFIX = "RECR-";

export function formatRecruiterInviteCode(): string {
  return `${CODE_PREFIX}${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function createUniqueRecruiterInvite(companyId: string) {
  return withDatabase(async () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = formatRecruiterInviteCode();
      try {
        return await prisma.recruiterInvite.create({
          data: { code, companyId, isUsed: false },
        });
      } catch {
        // unique collision — retry
      }
    }
    throw new Error("Failed to generate a unique recruiter code");
  });
}
