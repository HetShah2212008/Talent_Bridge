import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDbUser } from "@/lib/auth/get-user";
import prisma from "@/lib/prisma";

export default async function CandidateApplicationsPage() {
  const user = await requireDbUser();

  const applications = await prisma.application.findMany({
    where: { candidateId: user.id },
    include: {
      job: true,
      statusUpdatedBy: { select: { email: true } },
    },
    orderBy: { statusUpdatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Applications"
        description="Track every stage of your job applications."
      />

      {applications.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No applications yet.{" "}
          <Link href="/candidate/jobs" className="text-primary underline">
            Browse jobs
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <Link key={app.id} href={`/candidate/applications/${app.id}`}>
              <Card className="hover:bg-muted/30 transition-colors h-full">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg">{app.job.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{app.job.company}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                  <br />
                  Updated {new Date(app.statusUpdatedAt).toLocaleString()}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
