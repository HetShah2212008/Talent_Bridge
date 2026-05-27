import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  APPLICATION_STATUSES,
  isValidStatusTransition,
  STATUS_LABELS,
} from "@/lib/constants/application";
import { canManageApplication } from "@/lib/workflows/job-access";
import { ApplicationStatus, Role } from "@prisma/client";

type DbUser = { id: string; role: Role | null };

export function revalidateApplicationPaths() {
  revalidatePath("/candidate/dashboard");
  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/jobs");
  revalidatePath("/candidate/messages");
  revalidatePath("/recruiter/dashboard");
  revalidatePath("/recruiter/candidates");
  revalidatePath("/recruiter/jobs");
}

export async function applyToJobWorkflow(dbUser: DbUser, jobId: string) {
  if (dbUser.role !== Role.CANDIDATE) {
    throw new Error("Only candidates can apply to jobs");
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  const existing = await prisma.application.findUnique({
    where: { candidateId_jobId: { candidateId: dbUser.id, jobId } },
  });
  if (existing) throw new Error("You have already applied to this job");

  const application = await prisma.application.create({
    data: {
      candidateId: dbUser.id,
      jobId,
      status: ApplicationStatus.APPLIED,
      statusUpdatedAt: new Date(),
    },
  });

  revalidateApplicationPaths();

  return {
    success: true,
    applicationId: application.id,
    jobTitle: job.title,
    status: application.status,
  };
}

export async function updateApplicationStatusWorkflow(
  dbUser: DbUser,
  applicationId: string,
  status: ApplicationStatus
) {
  if (!APPLICATION_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }

  const { allowed, application } = await canManageApplication(dbUser, applicationId);
  if (!application || !allowed) {
    throw new Error("Unauthorized");
  }

  if (!isValidStatusTransition(application.status, status)) {
    throw new Error(
      `Cannot move from ${STATUS_LABELS[application.status]} to ${STATUS_LABELS[status]}`
    );
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status,
      statusUpdatedAt: new Date(),
      statusUpdatedById: dbUser.id,
    },
  });

  revalidateApplicationPaths();
  revalidatePath(`/recruiter/applications/${applicationId}`);
  revalidatePath(`/candidate/applications/${applicationId}`);
  revalidatePath(`/recruiter/jobs/${application.jobId}/applicants`);

  return { success: true, status };
}
