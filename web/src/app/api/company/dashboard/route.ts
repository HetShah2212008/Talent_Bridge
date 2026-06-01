export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiRole } from "@/lib/auth/api-user";
import { getCompanyDashboardStats } from "@/lib/company/stats";
import { runApiWithDb } from "@/lib/db-handler";

export async function GET() {
  return runApiWithDb(async () => {
    const authResult = await requireApiRole([Role.COMPANY]);
    if ("error" in authResult) return authResult.error;

    try {
      const stats = await getCompanyDashboardStats(authResult.dbUser.id);
      return NextResponse.json(stats);
    } catch (err) {
      console.error("[company/dashboard]", err);
      return NextResponse.json(
        { error: "Failed to load company analytics" },
        { status: 500 }
      );
    }
  });
}
