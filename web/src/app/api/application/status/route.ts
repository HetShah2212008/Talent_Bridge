import { NextResponse } from "next/server";
import { getApiDbUser, jsonUnauthorized } from "@/lib/auth/api-user";
import { updateApplicationStatusWorkflow } from "@/lib/workflows/applications";
import { ApplicationStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  const dbUser = await getApiDbUser();
  if (!dbUser) return jsonUnauthorized();

  let body: { applicationId?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const applicationId = body.applicationId?.trim();
  const status = body.status as ApplicationStatus | undefined;

  if (!applicationId || !status) {
    return NextResponse.json(
      { error: "applicationId and status are required" },
      { status: 400 }
    );
  }

  try {
    const result = await updateApplicationStatusWorkflow(
      dbUser,
      applicationId,
      status
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update status";
    const statusCode =
      message === "Unauthorized" || message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
