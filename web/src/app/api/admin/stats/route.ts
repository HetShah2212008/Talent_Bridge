import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiRole } from "@/lib/auth/api-user";
import { getAdminStats } from "@/lib/admin/stats";
import { runApiWithDb } from "@/lib/db-handler";

export async function GET() {
  return runApiWithDb(async () => {
    const authResult = await requireApiRole([Role.ADMIN, Role.COMPANY]);
    if ("error" in authResult) return authResult.error;

    try {
      const stats = await getAdminStats();
      return NextResponse.json(stats);
    } catch (err) {
      console.error("[admin/stats]", err);
      return NextResponse.json(
        { error: "Failed to load analytics" },
        { status: 500 }
      );
    }
  });
}
