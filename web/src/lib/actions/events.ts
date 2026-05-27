"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth/get-user";
import { isValidStatusTransition } from "@/lib/constants/application";
import { canManageApplication } from "@/lib/workflows/job-access";
import { ApplicationStatus, EventType, Role } from "@prisma/client";

function revalidateEventPaths(applicationId: string) {
  revalidatePath("/candidate/dashboard");
  revalidatePath("/recruiter/dashboard");
  revalidatePath(`/recruiter/applications/${applicationId}`);
  revalidatePath(`/candidate/applications/${applicationId}`);
}

export async function scheduleEvent(
  applicationId: string,
  formData: FormData
) {
  const user = await requireDbUser();
  const { allowed, application } = await canManageApplication(user, applicationId);

  if (!application || !allowed) {
    throw new Error("Application not found");
  }

  const type = formData.get("type") as EventType;
  const title = (formData.get("title") as string)?.trim();
  const scheduledAt = formData.get("scheduledAt") as string;
  const meetingLink = (formData.get("meetingLink") as string)?.trim() || null;
  const instructions = (formData.get("instructions") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const updateStatus = formData.get("updateStatus") === "true";

  if (!title || !scheduledAt) {
    throw new Error("Title and date/time are required");
  }

  if (!["OA", "INTERVIEW", "MEETING"].includes(type)) {
    throw new Error("Invalid event type");
  }

  const recruiterId =
    user.role === Role.RECRUITER ? user.id : application.job.recruiterId;

  await prisma.event.create({
    data: {
      type,
      title,
      scheduledAt: new Date(scheduledAt),
      meetingLink,
      instructions,
      notes,
      applicationId,
      candidateId: application.candidateId,
      recruiterId,
    },
  });

  if (updateStatus) {
    const newStatus =
      type === EventType.OA
        ? ApplicationStatus.OA_SCHEDULED
        : type === EventType.INTERVIEW
          ? ApplicationStatus.INTERVIEW
          : application.status;

    if (
      newStatus !== application.status &&
      isValidStatusTransition(application.status, newStatus)
    ) {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
          statusUpdatedAt: new Date(),
          statusUpdatedById: user.id,
        },
      });
    }
  }

  revalidateEventPaths(applicationId);
  return { success: true };
}
