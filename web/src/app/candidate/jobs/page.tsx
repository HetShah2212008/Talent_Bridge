import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobCard } from "@/components/jobs/JobCard";
import { requireDbUser } from "@/lib/auth/get-user";
import { fetchJobsSemanticSearch } from "@/lib/ai/search";
import { checkAiHealth } from "@/lib/ai/client";
import prisma from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function CandidateJobsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const user = await requireDbUser();
  const aiOnline = await checkAiHealth();

  let jobs: Awaited<ReturnType<typeof fetchJobsSemanticSearch>> = [];
  let searchError: string | null = null;

  if (q?.trim()) {
    if (!aiOnline) {
      searchError =
        "AI service is offline. Start it with: uvicorn app.main:app --reload --port 8000";
      jobs = await prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        include: {
          recruiter: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      try {
        jobs = await fetchJobsSemanticSearch(q.trim());
      } catch {
        searchError = "Semantic search failed. Showing text fallback.";
        jobs = await prisma.job.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          include: {
            recruiter: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }
    }
  } else {
    jobs = await prisma.job.findMany({
      include: {
        recruiter: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const myApplications = await prisma.application.findMany({
    where: { candidateId: user.id },
    select: { jobId: true },
  });
  const appliedJobIds = new Set(myApplications.map((a) => a.jobId));

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Browse Jobs"
        description='Hybrid AI search: abbreviations like "sd" or "fe", skills, and job titles.'
      />
      <Suspense fallback={null}>
        <JobSearch defaultQuery={q ?? ""} />
      </Suspense>

      {q && aiOnline && !searchError && (
        <p className="text-sm text-muted-foreground">
          Ranked by hybrid AI (semantic + title/skills keywords). Strong matches
          typically show 80%+.
        </p>
      )}
      {searchError && (
        <p className="text-sm text-amber-600 dark:text-amber-400">{searchError}</p>
      )}

      {jobs.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {q
            ? "No strong matches found. Try a more specific query (e.g. software developer, react frontend)."
            : "No jobs posted yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              alreadyApplied={appliedJobIds.has(job.id)}
              matchPercent={"matchPercent" in job ? job.matchPercent : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
