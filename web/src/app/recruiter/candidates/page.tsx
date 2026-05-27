import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { requireDbUser } from "@/lib/auth/get-user";
import prisma from "@/lib/prisma";

export default async function RecruiterCandidatesPage() {
  const user = await requireDbUser();

  const applications = await prisma.application.findMany({
    where: { job: { recruiterId: user.id } },
    include: {
      candidate: true,
      job: true,
      statusUpdatedBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { statusUpdatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="All Candidates"
        description="Manage applicants across all your job postings."
      />

      {applications.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No applications yet.
        </p>
      ) : (
        <PipelineBoard
          applications={applications}
          manageHref={(id) => `/recruiter/applications/${id}`}
        />
      )}
    </div>
  );
}
