"use server";

import { requireDbUser } from "@/lib/auth/get-user";
import {
  applyToJobWorkflow,
  updateApplicationStatusWorkflow,
} from "@/lib/workflows/applications";
import { ApplicationStatus } from "@prisma/client";

export async function applyToJob(jobId: string) {
  const user = await requireDbUser();
  return applyToJobWorkflow(user, jobId);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
) {
  const user = await requireDbUser();
  return updateApplicationStatusWorkflow(user, applicationId, status);
}
