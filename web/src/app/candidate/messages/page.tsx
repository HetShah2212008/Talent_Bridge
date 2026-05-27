import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { requireDbUser } from "@/lib/auth/get-user";
import prisma from "@/lib/prisma";

export default async function CandidateMessagesPage() {
  const user = await requireDbUser();

  const applications = await prisma.application.findMany({
    where: { candidateId: user.id },
    include: {
      job: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { statusUpdatedAt: "desc" },
  });

  // Sort by latest message - applications don't have updatedAt on relation, use statusUpdatedAt
  const sorted = [...applications].sort((a, b) => {
    const aTime = a.messages[0]?.createdAt ?? a.statusUpdatedAt;
    const bTime = b.messages[0]?.createdAt ?? b.statusUpdatedAt;
    return bTime.getTime() - aTime.getTime();
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Messages"
        description="Conversations with recruiters about your applications."
      />

      {sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Apply to jobs first to start messaging recruiters.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((app) => (
            <SectionCard key={app.id} title={`${app.job.title} · ${app.job.company}`}>
              {app.messages[0] ? (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {app.messages[0].text}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-3">No messages yet.</p>
              )}
              <Link
                href={`/candidate/applications/${app.id}`}
                className="text-primary underline text-sm"
              >
                Open conversation →
              </Link>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
