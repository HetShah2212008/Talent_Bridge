import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ButtonLink } from "@/components/ui/button-link";
import { requireDbUser } from "@/lib/auth/get-user";
import { displayName } from "@/lib/utils/user-display";
import prisma from "@/lib/prisma";

export default async function RecruiterDashboardPage() {
  const user = await requireDbUser();
  const jobFilter = { recruiterId: user.id };

  const [jobCount, applications, upcomingEvents] = await Promise.all([
    prisma.job.count({ where: jobFilter }),
    prisma.application.findMany({
      where: { job: jobFilter },
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
    }),
    prisma.event.findMany({
      where: { recruiterId: user.id, scheduledAt: { gte: new Date() } },
      include: {
        application: { include: { job: true, candidate: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Recruiter Dashboard"
        description={`Welcome, ${displayName(user)}. Manage your hiring pipeline, schedule events, and review candidates.`}
      >
        <ButtonLink href="/recruiter/jobs">Post Job</ButtonLink>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Active Jobs" value={jobCount} icon="briefcase" />
        <StatsCard title="Candidates" value={applications.length} icon="users" />
        <StatsCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          icon="calendar"
        />
      </div>

      <SectionCard title="Candidate Pipeline">
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No applications yet. Post a job to start receiving candidates.
          </p>
        ) : (
          <PipelineBoard
            applications={applications}
            manageHref={(id) => `/recruiter/applications/${id}`}
          />
        )}
      </SectionCard>

      {upcomingEvents.length > 0 && (
        <SectionCard title="Upcoming Schedule">
          <ul className="space-y-2">
            {upcomingEvents.map((e) => (
              <li
                key={e.id}
                className="text-sm border rounded-lg p-3 flex justify-between gap-4"
              >
                <span>
                  <strong>{e.title}</strong> — {displayName(e.application.candidate)}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {new Date(e.scheduledAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
