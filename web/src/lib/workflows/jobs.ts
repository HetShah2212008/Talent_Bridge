import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { syncJobEmbedding } from "@/lib/ai/jobs";
import { canManageJob } from "@/lib/workflows/job-access";
import { displayName } from "@/lib/utils/user-display";
import { Role } from "@prisma/client";

type DbUser = { id: string; role: Role | null };

export type JobInput = {
  title: string;
  company: string;
  description: string;
  skills: string;
  location?: string | null;
  salary?: string | null;
};

export function parseJobInput(data: JobInput): JobInput {
  const title = data.title?.trim();
  const company = data.company?.trim();
  const description = data.description?.trim();
  const skills = data.skills?.trim();
  const location = data.location?.trim() || null;
  const salary = data.salary?.trim() || null;

  if (!title || !company || !description || !skills) {
    throw new Error("Title, company, description, and skills are required");
  }

  return { title, company, description, skills, location, salary };
}

export async function createJobWorkflow(dbUser: DbUser, data: JobInput) {
  if (dbUser.role !== Role.RECRUITER) {
    throw new Error("Only recruiters can post jobs");
  }

  const fields = parseJobInput(data);

  const job = await prisma.job.create({
    data: {
      ...fields,
      recruiterId: dbUser.id,
    },
  });

  await syncJobEmbedding(job);

  revalidatePath("/recruiter/jobs");
  revalidatePath("/recruiter/dashboard");
  revalidatePath("/candidate/jobs");
  revalidatePath("/admin/dashboard");

  return { success: true, jobId: job.id, job };
}

export async function getJobApplicantsWorkflow(dbUser: DbUser, jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      recruiter: { select: { id: true, companyId: true } },
      applications: {
        include: {
          candidate: {
            include: { candidateProfile: true },
          },
        },
        orderBy: { statusUpdatedAt: "desc" },
      },
    },
  });

  if (!job) throw new Error("Job not found");

  const allowed = await canManageJob(dbUser, job);
  if (!allowed) throw new Error("Forbidden");

  return {
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      applicationCount: job.applications.length,
    },
    applicants: job.applications.map((app) => ({
      applicationId: app.id,
      status: app.status,
      appliedAt: app.createdAt,
      statusUpdatedAt: app.statusUpdatedAt,
      candidate: {
        id: app.candidate.id,
        email: app.candidate.email,
        firstName: app.candidate.firstName,
        lastName: app.candidate.lastName,
        displayName: displayName(app.candidate),
        hasResume: !!(
          app.candidate.candidateProfile?.resumeText ||
          app.candidate.candidateProfile?.resumeUrl
        ),
        resumeUrl: app.candidate.candidateProfile?.resumeUrl ?? null,
        resumePreview:
          app.candidate.candidateProfile?.resumeText?.slice(0, 200) ?? null,
      },
    })),
  };
}
