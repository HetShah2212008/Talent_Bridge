"use server";

import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import prisma from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth/get-user";
import { ensureCandidateProfile } from "@/lib/auth/candidate-profile";
import { embedResumeText } from "@/lib/ai/client";
import { Role } from "@prisma/client";

async function upsertResume(
  userId: string,
  resumeText: string,
  embedding: number[],
  resumeUrl?: string
) {
  await ensureCandidateProfile(userId);
  await prisma.candidateProfile.upsert({
    where: { userId },
    update: { resumeText, embedding, ...(resumeUrl ? { resumeUrl } : {}) },
    create: { userId, resumeText, embedding, resumeUrl: resumeUrl ?? null },
  });

  revalidatePath("/candidate/profile");
  revalidatePath("/candidate/dashboard");
  revalidatePath("/candidate/jobs");
}

export async function saveResumeText(resumeText: string) {
  const user = await requireDbUser();
  if (user.role !== Role.CANDIDATE && user.role !== Role.ADMIN) {
    throw new Error("Only candidates can upload a resume");
  }

  const trimmed = resumeText.trim();
  if (trimmed.length < 50) {
    throw new Error("Resume text must be at least 50 characters");
  }

  let embedding: number[];
  try {
    embedding = await embedResumeText(trimmed);
  } catch (error) {
    console.error("[AI] Resume embedding failed:", error);
    throw new Error(
      "AI service unavailable. Run: cd ai-service && uvicorn app.main:app --reload --port 8000"
    );
  }

  await upsertResume(user.id, trimmed, embedding);
  return { success: true };
}

export async function saveResumeFromPdf(formData: FormData) {
  const user = await requireDbUser();
  if (user.role !== Role.CANDIDATE && user.role !== Role.ADMIN) {
    throw new Error("Only candidates can upload a resume");
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Please select a PDF file");
  }
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("PDF must be smaller than 10MB");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
  await mkdir(uploadsDir, { recursive: true });
  const safeBaseName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}-${randomUUID()}-${safeBaseName}`;
  const absolutePath = path.join(uploadsDir, filename);
  const resumeUrl = `/uploads/resumes/${filename}`;

  const bytes = await file.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(bytes));

  const aiUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
  const body = new FormData();
  body.append("file", file, file.name);

  const embedRes = await fetch(`${aiUrl}/embed/resume`, {
    method: "POST",
    body,
  });

  if (!embedRes.ok) {
    const err = await embedRes.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail ??
        "AI service failed to parse resume. Is it running on port 8000?"
    );
  }

  const data = (await embedRes.json()) as {
    embedding: number[];
    extracted_text?: string;
  };

  const resumeText = data.extracted_text?.trim();
  if (!resumeText || resumeText.length < 50) {
    throw new Error("Could not extract enough text from PDF");
  }

  await upsertResume(user.id, resumeText, data.embedding, resumeUrl);
  return { success: true, resumeUrl };
}
