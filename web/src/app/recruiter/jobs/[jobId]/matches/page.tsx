import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MatchScoreBadge } from "@/components/ai/MatchScoreBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ButtonLink } from "@/components/ui/button-link";
import { requireDbUser } from "@/lib/auth/get-user";
import {
  buildJobText,
  matchCandidatesToJob,
  parseEmbedding,
  checkAiHealth,
} from "@/lib/ai/client";
import prisma from "@/lib/prisma";
import { displayName } from "@/lib/utils/user-display";
import { Role } from "@prisma/client";

type PageProps = { params: Promise<{ jobId: string }> };

export default async function JobMatchesPage({ params }: PageProps) {
  const { jobId } = await params;
  const user = await requireDbUser();

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) notFound();
  if (user.role !== Role.RECRUITER || job.recruiterId !== user.id) {
    notFound();
  }

  const candidates = await prisma.candidateProfile.findMany({
    where: { resumeText: { not: null } },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const aiOnline = await checkAiHealth();
  let matches: Awaited<ReturnType<typeof matchCandidatesToJob>> = [];
  let error: string | null = null;

  if (!aiOnline) {
    error = "AI service offline — start uvicorn on port 8000.";
  } else if (candidates.length === 0) {
    error = "No candidates with resumes yet.";
  } else {
    try {
      matches = await matchCandidatesToJob(
        parseEmbedding(job.embedding),
        buildJobText(
          job.title,
          job.company,
          job.description,
          job.skills,
          job.location
        ),
        candidates.map((c) => ({
          id: c.user.id,
          firstName: c.user.firstName,
          lastName: c.user.lastName,
          email: c.user.email,
          embedding: c.embedding,
          resume_text: c.resumeText,
        })),
        15
      );
    } catch {
      error = "Failed to compute candidate matches.";
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Top Matching Candidates"
        description={`Semantic matches for: ${job.title}`}
      >
        <ButtonLink href="/recruiter/jobs" variant="outline">
          Back to Jobs
        </ButtonLink>
      </DashboardHeader>

      {error && (
        <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
      )}

      {!error && matches.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Ranked by cosine similarity between job and resume embeddings.
        </p>
      )}

      <div className="hidden md:block rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No matches to display.
                </TableCell>
              </TableRow>
            ) : (
              matches.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{displayName(m)}</TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell>
                    <MatchScoreBadge percent={m.matchPercent} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {matches.map((m) => (
          <Card key={m.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{displayName(m)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{m.email}</p>
              <MatchScoreBadge percent={m.matchPercent} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
