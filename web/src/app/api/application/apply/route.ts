import { NextResponse } from "next/server";
import { getApiDbUser, jsonForbidden, jsonUnauthorized } from "@/lib/auth/api-user";
import { applyToJobWorkflow } from "@/lib/workflows/applications";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const dbUser = await getApiDbUser();
  if (!dbUser) return jsonUnauthorized();

  let body: { jobId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const jobId = body.jobId?.trim();
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  if (dbUser.role !== Role.CANDIDATE) {
    return jsonForbidden("Only candidates can apply to jobs");
  }

  try {
    const result = await applyToJobWorkflow(dbUser, jobId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to apply";
    const status = message.includes("already applied") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
