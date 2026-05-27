"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth/get-user";
import { isValidStatusTransition } from "@/lib/constants/application";
import { canManageApplication } from "@/lib/workflows/job-access";
import { ApplicationStatus } from "@prisma/client";

export async function uploadOfferLetter(
  applicationId: string,
  formData: FormData
) {
  const user = await requireDbUser();
  const { allowed, application } = await canManageApplication(user, applicationId);

  if (!application || !allowed) {
    throw new Error("Application not found");
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Please select a PDF file");
  if (file.type !== "application/pdf") throw new Error("Only PDF files allowed");

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "offers");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${applicationId}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  const offerLetterPath = `/uploads/offers/${filename}`;
  const newStatus = ApplicationStatus.SELECTED;

  if (!isValidStatusTransition(application.status, newStatus)) {
    throw new Error("Cannot mark as selected from current status");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      offerLetterPath,
      offerLetterUploadedAt: new Date(),
      status: newStatus,
      statusUpdatedAt: new Date(),
      statusUpdatedById: user.id,
    },
  });

  revalidatePath("/candidate/dashboard");
  revalidatePath(`/candidate/applications/${applicationId}`);
  revalidatePath(`/recruiter/applications/${applicationId}`);
  revalidatePath("/recruiter/dashboard");

  return { success: true, path: offerLetterPath };
}
