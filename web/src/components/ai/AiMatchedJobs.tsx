import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { JobCard } from "@/components/jobs/JobCard";
import { ButtonLink } from "@/components/ui/button-link";
import { fetchAiMatchedJobsForCandidate } from "@/lib/ai/search";
import { requireDbUser } from "@/lib/auth/get-user";
import { getCandidateProfile } from "@/lib/auth/candidate-profile";
import prisma from "@/lib/prisma";

export async function AiMatchedJobs() {
  const user = await requireDbUser();
  const profile = await getCandidateProfile(user.id);

  if (!profile?.resumeText && !profile?.embedding) {
    return (
      <SectionCard title="AI Matched Jobs">
        <p className="text-sm text-muted-foreground">
          Upload your resume on{" "}
          <Link href="/candidate/profile" className="text-primary underline">
            Profile
          </Link>{" "}
          to see jobs ranked by real semantic similarity to your experience.
        </p>
      </SectionCard>
    );
  }

  const matched = await fetchAiMatchedJobsForCandidate(user.id, 3);
  const applications = await prisma.application.findMany({
    where: { candidateId: user.id },
    select: { jobId: true },
  });
  const appliedIds = new Set(applications.map((a) => a.jobId));

  if (matched.length === 0) {
    return (
      <SectionCard title="AI Matched Jobs">
        <p className="text-sm text-muted-foreground">
          No strong matches yet, or AI service is offline. Try browsing all jobs.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="AI Matched Jobs"
      action={
        <ButtonLink href="/candidate/jobs" variant="outline" size="sm">
          Browse all
        </ButtonLink>
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Ranked using cosine similarity between your resume embedding and each job.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matched.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            alreadyApplied={appliedIds.has(job.id)}
            matchPercent={job.matchPercent}
          />
        ))}
      </div>
    </SectionCard>
  );
}
