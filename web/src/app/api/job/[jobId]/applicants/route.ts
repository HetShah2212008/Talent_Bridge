export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getApiDbUser, jsonUnauthorized } from "@/lib/auth/api-user";
import { getJobApplicantsWorkflow } from "@/lib/workflows/jobs";

type RouteContext = { params: Promise<{ jobId: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const dbUser = await getApiDbUser();
  if (!dbUser) return jsonUnauthorized();

  const { jobId } = await context.params;

  try {
    const data = await getJobApplicantsWorkflow(dbUser, jobId);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load applicants";
    const status = message === "Forbidden" ? 403 : message === "Job not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
