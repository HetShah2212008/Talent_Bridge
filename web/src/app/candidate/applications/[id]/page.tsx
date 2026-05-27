import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { MessageThread } from "@/components/messages/MessageThread";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { requireDbUser } from "@/lib/auth/get-user";
import prisma from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function CandidateApplicationPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireDbUser();

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: true,
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

  if (!application || application.candidateId !== user.id) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={application.job.title}
        description={application.job.company}
      >
        <ButtonLink href="/candidate/dashboard" variant="outline">
          Back to dashboard
        </ButtonLink>
      </DashboardHeader>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Status:</span>
        <StatusBadge status={application.status} />
        <span className="text-xs text-muted-foreground">
          Updated {new Date(application.statusUpdatedAt).toLocaleString()}
        </span>
      </div>

      <SectionCard title="Upcoming events">
        {application.events.filter((e) => new Date(e.scheduledAt) >= new Date())
          .length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events.</p>
        ) : (
          <ul className="space-y-3">
            {application.events
              .filter((e) => new Date(e.scheduledAt) >= new Date())
              .map((e) => (
                <li key={e.id} className="border rounded-lg p-3">
                  <p className="font-medium">{e.title}</p>
                  <Badge variant="outline" className="mt-1">
                    {e.type}
                  </Badge>
                  <p className="text-sm mt-2">
                    {new Date(e.scheduledAt).toLocaleString()}
                  </p>
                  {e.meetingLink && (
                    <a
                      href={e.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline text-sm"
                    >
                      Join meeting
                    </a>
                  )}
                  {e.instructions && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {e.instructions}
                    </p>
                  )}
                </li>
              ))}
          </ul>
        )}
      </SectionCard>

      {application.offerLetterPath && (
        <SectionCard title="Offer letter">
          <p className="text-sm text-muted-foreground mb-3">
            Congratulations! Your offer letter is ready.
          </p>
          <a
            href={application.offerLetterPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Download Offer PDF
          </a>
        </SectionCard>
      )}

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
