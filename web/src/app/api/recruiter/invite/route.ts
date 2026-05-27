import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiRole } from "@/lib/auth/api-user";
import { createUniqueRecruiterInvite } from "@/lib/recruiter-invite";
import { runApiWithDb } from "@/lib/db-handler";

/** Create a recruiter invite code (COMPANY only). */
export async function POST() {
  return runApiWithDb(async () => {
    const authResult = await requireApiRole([Role.COMPANY]);
    if ("error" in authResult) return authResult.error;

    const { dbUser } = authResult;

    try {
      const invite = await createUniqueRecruiterInvite(dbUser.id);
      return NextResponse.json({
        success: true,
        code: invite.code,
        id: invite.id,
      });
    } catch (err) {
      console.error("[recruiter/invite]", err);
      return NextResponse.json(
        { error: "Failed to generate recruiter code" },
        { status: 500 }
      );
    }
  });
}
