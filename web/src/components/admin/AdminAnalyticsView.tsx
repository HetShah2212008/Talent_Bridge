import { ButtonLink } from "@/components/ui/button-link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SectionCard } from "@/components/dashboard/SectionCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminStatsResponse } from "@/lib/admin/stats";

export function AdminAnalyticsView({ stats }: { stats: AdminStatsResponse }) {
  const jobs = stats.jobs.withApplications ?? [];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="System Administration"
        description="Live platform analytics from PostgreSQL."
      >
        <ButtonLink href="/admin/users" variant="outline">
          All Users
        </ButtonLink>
      </DashboardHeader>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard title="Total Users" value={stats.users.total} icon="users" />
        <StatsCard title="Candidates" value={stats.users.candidates} icon="users" />
        <StatsCard title="Recruiters" value={stats.users.recruiters} icon="briefcase" />
        <StatsCard title="Companies" value={stats.users.companies} icon="building" />
        <StatsCard title="Jobs" value={stats.jobs.total} icon="briefcase" />
        <StatsCard
          title="Applications"
          value={stats.applications.total}
          icon="file-text"
        />
      </div>

      <SectionCard
        title="Applications per job"
        description={`${stats.jobs.total} job(s) in the system`}
      >
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No jobs posted yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job title</TableHead>
                <TableHead className="text-right">Number of applications</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {job.applicationCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
