import prisma from "@/lib/prisma";
import {
  semanticSearchJobs,
  matchJobsToResume,
  parseEmbedding,
  AiServiceError,
} from "@/lib/ai/client";

/** Hide weak AI matches in the UI (server-side safety net). */
const MIN_DISPLAY_MATCH_PERCENT = 40;

export type JobWithMatch = Awaited<
  ReturnType<typeof prisma.job.findMany>
>[number] & {
  recruiter: {
    firstName: string;
    lastName: string;
    email: string;
  };
  matchPercent?: number;
};

export async function fetchJobsSemanticSearch(
  query: string
): Promise<JobWithMatch[]> {
  const jobs = await prisma.job.findMany({
    include: {
      recruiter: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (jobs.length === 0) return [];

  try {
    const results = await semanticSearchJobs(query, jobs);
    const scoreMap = new Map(
      results.map((r) => [r.id, r.matchPercent])
    );
    const orderMap = new Map(results.map((r, i) => [r.id, i]));

    return jobs
      .filter((j) => orderMap.has(j.id))
      .map((j) => ({
        ...j,
        matchPercent: scoreMap.get(j.id),
      }))
      .filter(
        (j) =>
          j.matchPercent != null && j.matchPercent >= MIN_DISPLAY_MATCH_PERCENT
      )
      .sort((a, b) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99));
  } catch (error) {
    if (error instanceof AiServiceError) throw error;
    console.error("[AI] Semantic search failed:", error);
    throw new Error("AI semantic search unavailable");
  }
}

export async function fetchAiMatchedJobsForCandidate(
  userId: string,
  topK = 6
): Promise<JobWithMatch[]> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
  });

  if (!profile?.resumeText && !profile?.embedding) {
    return [];
  }

  const jobs = await prisma.job.findMany({
    include: {
      recruiter: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  if (jobs.length === 0) return [];

  const embedding = parseEmbedding(profile.embedding);

  try {
    const matches = await matchJobsToResume(
      embedding,
      profile.resumeText,
      jobs,
      topK
    );
    const orderMap = new Map(matches.map((m, i) => [m.id, i]));
    const scoreMap = new Map(matches.map((m) => [m.id, m.matchPercent]));

    return jobs
      .filter((j) => orderMap.has(j.id))
      .sort((a, b) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99))
      .map((j) => ({ ...j, matchPercent: scoreMap.get(j.id) }));
  } catch (error) {
    console.error("[AI] Job matching failed:", error);
    return [];
  }
}
