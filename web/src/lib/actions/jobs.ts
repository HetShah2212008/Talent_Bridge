"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth/get-user";
import { syncJobEmbedding } from "@/lib/ai/jobs";
import { canManageJob } from "@/lib/workflows/job-access";
import { createJobWorkflow, parseJobInput } from "@/lib/workflows/jobs";
import { Role } from "@prisma/client";

function parseJobForm(formData: FormData) {
  return parseJobInput({
    title: (formData.get("title") as string) ?? "",
    company: (formData.get("company") as string) ?? "",
    description: (formData.get("description") as string) ?? "",
    skills: (formData.get("skills") as string) ?? "",
    location: (formData.get("location") as string) ?? "",
    salary: (formData.get("salary") as string) ?? "",
  });
}

export async function createJob(formData: FormData) {
  const user = await requireDbUser();
  return createJobWorkflow(user, parseJobForm(formData));
}

export async function updateJob(jobId: string, formData: FormData) {
  const user = await requireDbUser();
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { recruiter: { select: { companyId: true } } },
  });

  if (!job) throw new Error("Job not found");
  if (!(await canManageJob(user, job))) {
    throw new Error("Unauthorized");
  }

  const fields = parseJobForm(formData);

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: fields,
  });

  await syncJobEmbedding(updated);

  revalidatePath("/recruiter/jobs");
  revalidatePath("/recruiter/dashboard");
  revalidatePath("/candidate/jobs");

  return { success: true };
}

export async function deleteJob(jobId: string) {
  const user = await requireDbUser();
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { recruiter: { select: { companyId: true } } },
  });

  if (!job) throw new Error("Job not found");
  if (!(await canManageJob(user, job))) {
    throw new Error("Unauthorized");
  }

  await prisma.job.delete({ where: { id: jobId } });

  revalidatePath("/recruiter/jobs");
  revalidatePath("/recruiter/dashboard");
  revalidatePath("/recruiter/candidates");
  revalidatePath("/candidate/jobs");
  revalidatePath("/admin/dashboard");

  return { success: true };
}
