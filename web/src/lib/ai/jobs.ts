import prisma from "@/lib/prisma";
import { buildJobText, embedJobText, parseEmbedding } from "@/lib/ai/client";

type JobForEmbed = {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string;
  location: string | null;
};

export async function syncJobEmbedding(job: JobForEmbed) {
  try {
    const text = buildJobText(
      job.title,
      job.company,
      job.description,
      job.skills,
      job.location
    );
    const embedding = await embedJobText(text);
    await prisma.job.update({
      where: { id: job.id },
      data: { embedding },
    });
  } catch (error) {
    console.error(`[AI] Failed to embed job ${job.id}:`, error);
  }
}

export function getJobEmbedding(job: { embedding: unknown }): number[] | null {
  return parseEmbedding(job.embedding);
}
