import { notFound } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ApplicationStatusSelect } from "@/components/applications/ApplicationStatusSelect";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { ScheduleEventForm } from "@/components/events/ScheduleEventForm";
import { MessageThread } from "@/components/messages/MessageThread";
import { OfferUploadForm } from "@/components/offers/OfferUploadForm";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { ButtonLink } from "@/components/ui/button-link";
import { requireDbUser } from "@/lib/auth/get-user";
import { canManageJob } from "@/lib/workflows/job-access";
import { displayName } from "@/lib/utils/user-display";
import prisma from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function RecruiterApplicationPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireDbUser();

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: {
        include: { recruiter: { select: { companyId: true } } },
      },
      candidate: {
        include: { candidateProfile: true },
      },
      statusUpdatedBy: true,
      events: { orderBy: { scheduledAt: "asc" } },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (
    !application ||
    !(await canManageJob(user, {
      recruiterId: application.job.recruiterId,
      recruiter: application.job.recruiter,
    }))
  ) {
    notFound();
  }

  const profile = application.candidate.candidateProfile;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={displayName(application.candidate)}
        description={`${application.job.title} at ${application.job.company}`}
      >
        <ButtonLink href="/recruiter/dashboard" variant="outline">
          Back to pipeline
        </ButtonLink>
      </DashboardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Status & activity">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Current:</span>
              <StatusBadge status={application.status} />
            </div>
            <ApplicationStatusSelect
              applicationId={application.id}
              currentStatus={application.status}
            />
            <p className="text-xs text-muted-foreground">
              Last updated {new Date(application.statusUpdatedAt).toLocaleString()}
              {application.statusUpdatedBy && (
                <> by {application.statusUpdatedBy.email}</>
              )}
            </p>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Name </span>
                <span className="text-muted-foreground">
                  {displayName(application.candidate)}
                </span>
              </p>
              <p>
                <span className="font-medium">Email </span>
                <span className="text-muted-foreground">{application.candidate.email}</span>
              </p>
              {profile?.resumeText ? (
                <p className="text-muted-foreground pt-2 border-t mt-2 line-clamp-4">
                  <span className="font-medium text-foreground">Resume: </span>
                  {profile.resumeText.slice(0, 400)}
                  {profile.resumeText.length > 400 ? "…" : ""}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs pt-2">No resume on file</p>
              )}
              {profile?.resumeUrl && (
                <div className="flex gap-3 text-xs pt-2">
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    View Resume PDF
                  </a>
                  <a href={profile.resumeUrl} download className="text-primary underline">
                    Download Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Schedule OA / Interview / Meeting">
          <ScheduleEventForm applicationId={application.id} />
        </SectionCard>
      </div>

      <SectionCard title="Scheduled events">
        {application.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {application.events.map((e) => (
              <li key={e.id} className="border rounded-lg p-3 text-sm">
                <p className="font-medium">
                  {e.title} <span className="text-muted-foreground">({e.type})</span>
                </p>
                <p>{new Date(e.scheduledAt).toLocaleString()}</p>
                {e.meetingLink && (
                  <a href={e.meetingLink} className="text-primary underline" target="_blank">
                    Meeting link
                  </a>
                )}
                {e.instructions && (
                  <p className="text-muted-foreground mt-1">{e.instructions}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Offer letter">
        {application.offerLetterPath ? (
          <div className="space-y-2 mb-4">
            <p className="text-sm text-green-600 dark:text-green-400">
              Offer uploaded{" "}
              {application.offerLetterUploadedAt &&
                new Date(application.offerLetterUploadedAt).toLocaleString()}
            </p>
            <a
              href={application.offerLetterPath}
              target="_blank"
              className="text-primary underline text-sm"
            >
              View current offer PDF
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">
            Upload a PDF offer letter for the candidate to download.
          </p>
        )}
        <OfferUploadForm applicationId={application.id} />
      </SectionCard>

      <SectionCard title="Messages">
        <MessageThread
          applicationId={application.id}
          messages={application.messages}
          currentUserId={user.id}
        />
      </SectionCard>
    </div>
  );
}
