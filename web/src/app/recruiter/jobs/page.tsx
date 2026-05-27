import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { JobForm } from "@/components/jobs/JobForm";
import { JobList } from "@/components/jobs/JobList";
import { requireDbUser } from "@/lib/auth/get-user";
import prisma from "@/lib/prisma";
export default async function RecruiterJobsPage() {
  const user = await requireDbUser();

  const jobs = await prisma.job.findMany({
    where: { recruiterId: user.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Job Postings"
        description="Create and manage your open positions."
      />
      <JobForm />
      <JobList jobs={jobs} />
    </div>
  );
}
