import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { AiMatchedJobs } from "@/components/ai/AiMatchedJobs";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDbUser } from "@/lib/auth/get-user";
import { displayName } from "@/lib/utils/user-display";
import prisma from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export default async function CandidateDashboardPage() {
  const user = await requireDbUser();

  const [applications, upcomingEvents, latestJobs, messageCount] =
    await Promise.all([
      prisma.application.findMany({
        where: { candidateId: user.id },
        include: {
          job: true,
          statusUpdatedBy: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { statusUpdatedAt: "desc" },
      }),
      prisma.event.findMany({
        where: {
          candidateId: user.id,
          scheduledAt: { gte: new Date() },
        },
        include: { application: { include: { job: true } } },
        orderBy: { scheduledAt: "asc" },
        take: 8,
      }),
      prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.message.count({
        where: {
          OR: [{ senderId: user.id }, { receiverId: user.id }],
        },
      }),
    ]);

  const appliedJobIds = new Set(applications.map((a) => a.jobId));
  const activeCount = applications.filter(
    (a) => a.status !== ApplicationStatus.REJECTED
  ).length;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Candidate Dashboard"
        description={`Welcome, ${displayName(user)}. Track applications, events, and new opportunities.`}
      >
        <ButtonLink href="/candidate/jobs">Browse Jobs</ButtonLink>
      </DashboardHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Applications" value={applications.length} icon="file-text" />
        <StatsCard title="Active" value={activeCount} icon="briefcase" />
        <StatsCard title="Upcoming Events" value={upcomingEvents.length} icon="calendar" />
        <StatsCard title="Messages" value={messageCount} icon="message-square" />
      </div>

      <SectionCard
        title="Application Status Tracker"
        action={
          <ButtonLink href="/candidate/applications" variant="outline" size="sm">
            View all
          </ButtonLink>
        }
      >
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No applications yet.{" "}
            <Link href="/candidate/jobs" className="text-primary underline">
              Browse jobs
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.slice(0, 6).map((app) => (
              <Link key={app.id} href={`/candidate/applications/${app.id}`}>
                <Card className="hover:bg-muted/30 transition-colors h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-base">{app.job.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{app.job.company}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Updated {new Date(app.statusUpdatedAt).toLocaleString()}
                    {app.statusUpdatedBy && (
                      <span> · by recruiter</span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Upcoming Events"
        description="OA tests, interviews, and meetings"
      >
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No upcoming events scheduled.
          </p>
        ) : (
          <ul className="space-y-3">
            {upcomingEvents.map((event) => (
              <li
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.application.job.company} · {event.application.job.title}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {event.type}
                  </Badge>
                </div>
                <div className="text-sm text-right">
                  <p>{new Date(event.scheduledAt).toLocaleString()}</p>
                  {event.meetingLink && (
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline text-xs"
                    >
                      Join meeting
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <AiMatchedJobs />

      <SectionCard
        title="Latest Jobs"
        action={
          <ButtonLink href="/candidate/jobs" variant="outline" size="sm">
            Search all jobs
          </ButtonLink>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </CardHeader>
              <CardContent>
                <ApplyButton
                  jobId={job.id}
                  jobTitle={job.title}
                  alreadyApplied={appliedJobIds.has(job.id)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Messages">
        <p className="text-sm text-muted-foreground mb-3">
          Chat with recruiters about your applications.
        </p>
        <ButtonLink href="/candidate/messages">Open Messages</ButtonLink>
      </SectionCard>
    </div>
  );
}
