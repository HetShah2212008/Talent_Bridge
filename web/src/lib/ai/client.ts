const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ?? "http://localhost:8000";

export class AiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiServiceError";
  }
}

async function aiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${AI_SERVICE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail =
      typeof err.detail === "string"
        ? err.detail
        : JSON.stringify(err.detail ?? err);
    throw new AiServiceError(detail || "AI service request failed");
  }

  return res.json() as Promise<T>;
}

export async function checkAiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`, {
      next: { revalidate: 0 },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function buildJobText(
  title: string,
  company: string,
  description: string,
  skills: string,
  location?: string | null
): string {
  const parts = [
    title,
    `Company: ${company}`,
    description,
    `Skills: ${skills}`,
  ];
  if (location?.trim()) parts.push(`Location: ${location.trim()}`);
  return parts.join("\n");
}

export async function embedJobText(text: string): Promise<number[]> {
  const data = await aiFetch<{ embedding: number[] }>("/embed/job", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return data.embedding;
}

export async function embedResumeText(text: string): Promise<number[]> {
  const data = await aiFetch<{ embedding: number[] }>("/embed/resume/json", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return data.embedding;
}

type JobForAi = {
  id: string;
  title: string;
  company?: string;
  description: string;
  skills?: string;
  location: string | null;
  embedding?: unknown;
};

function jobTextForAi(job: JobForAi) {
  return [
    job.company ? `Company: ${job.company}` : "",
    job.description,
    job.skills ? `Skills: ${job.skills}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function semanticSearchJobs(
  query: string,
  jobs: JobForAi[]
): Promise<{ id: string; score: number; matchPercent: number }[]> {
  const payload = {
    query,
    jobs: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      description: j.description,
      skills: j.skills ?? "",
      location: j.location,
      embedding: parseEmbedding(j.embedding),
    })),
  };

  const data = await aiFetch<{
    results: Array<{ id: string; score: number; matchPercent: number }>;
  }>("/search/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return data.results;
}

export async function matchJobsToResume(
  resumeEmbedding: number[] | null,
  resumeText: string | null,
  jobs: JobForAi[],
  topK = 6
): Promise<Array<{ id: string; score: number; matchPercent: number }>> {
  const data = await aiFetch<{
    matches: Array<{ id: string; score: number; matchPercent: number }>;
  }>("/match/jobs", {
    method: "POST",
    body: JSON.stringify({
      resume_embedding: resumeEmbedding,
      resume_text: resumeText,
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        description: jobTextForAi(j),
        location: j.location,
        embedding: parseEmbedding(j.embedding),
      })),
      top_k: topK,
    }),
  });

  return data.matches;
}

export async function matchCandidatesToJob(
  jobEmbedding: number[] | null,
  jobText: string | null,
  candidates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    embedding?: unknown;
    resume_text?: string | null;
  }>,
  topK = 10
): Promise<
  Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    score: number;
    matchPercent: number;
  }>
> {
  const data = await aiFetch<{
    matches: Array<{
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      score: number;
      matchPercent: number;
    }>;
  }>("/match/candidates", {
    method: "POST",
    body: JSON.stringify({
      job_embedding: jobEmbedding,
      job_text: jobText,
      candidates: candidates.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        embedding: parseEmbedding(c.embedding),
        resume_text: c.resume_text,
      })),
      top_k: topK,
    }),
  });

  const byId = new Map(candidates.map((c) => [c.id, c]));
  return data.matches.map((m) => {
    const src = byId.get(m.id);
    return {
      id: m.id,
      firstName: src?.firstName ?? m.firstName ?? "",
      lastName: src?.lastName ?? m.lastName ?? "",
      email: src?.email ?? m.email ?? "",
      score: m.score,
      matchPercent: m.matchPercent,
    };
  });
}

export function parseEmbedding(value: unknown): number[] | null {
  if (!value || !Array.isArray(value)) return null;
  if (!value.every((n) => typeof n === "number")) return null;
  return value as number[];
}
