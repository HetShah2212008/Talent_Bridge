"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth/get-user";
import { canManageApplication } from "@/lib/workflows/job-access";
import { Role } from "@prisma/client";

export async function sendMessage(applicationId: string, text: string) {
  const user = await requireDbUser();
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Message cannot be empty");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { include: { recruiter: { select: { companyId: true } } } },
    },
  });
  if (!application) throw new Error("Application not found");

  const isCandidate =
    user.role === Role.CANDIDATE && application.candidateId === user.id;
  const canManage = await canManageApplication(user, applicationId);

  if (!isCandidate && !canManage.allowed) throw new Error("Unauthorized");

  const receiverId = isCandidate
    ? application.job.recruiterId
    : application.candidateId;

  await prisma.message.create({
    data: {
      text: trimmed,
      senderId: user.id,
      receiverId,
      applicationId,
    },
  });

  revalidatePath("/candidate/messages");
  revalidatePath("/recruiter/candidates");
  revalidatePath(`/candidate/applications/${applicationId}`);
  revalidatePath(`/recruiter/applications/${applicationId}`);
  revalidatePath("/candidate/dashboard");
  revalidatePath("/recruiter/dashboard");

  return { success: true };
}
