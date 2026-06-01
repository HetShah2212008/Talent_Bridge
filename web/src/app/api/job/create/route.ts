export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getApiDbUser, jsonForbidden, jsonUnauthorized } from "@/lib/auth/api-user";
import { createJobWorkflow, type JobInput } from "@/lib/workflows/jobs";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const dbUser = await getApiDbUser();
  if (!dbUser) return jsonUnauthorized();

  if (dbUser.role !== Role.RECRUITER) {
    return jsonForbidden("Only recruiters can create jobs");
  }

  let body: JobInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const result = await createJobWorkflow(dbUser, body);
    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      job: {
        id: result.job.id,
        title: result.job.title,
        company: result.job.company,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create job" },
      { status: 400 }
    );
  }
}
