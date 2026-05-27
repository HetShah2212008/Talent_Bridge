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
import { Badge } from "@/components/ui/badge";
import type { CompanyDashboardResponse } from "@/lib/company/stats";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/constants/application";

export function CompanyAnalyticsView({
  stats,
}: {
  stats: CompanyDashboardResponse;
}) {
  const jobs = stats.jobs ?? [];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Company analytics"
        description="Live metrics for your organization from PostgreSQL."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard title="Team members" value={stats.totalUsers} icon="users" />
        <StatsCard
          title="Candidates"
          value={stats.totalCandidates}
          icon="users"
          description="Unique applicants to your jobs"
        />
        <StatsCard title="Recruiters" value={stats.totalRecruiters} icon="briefcase" />
        <StatsCard title="Companies" value={stats.totalCompanies} icon="building" />
        <StatsCard title="Jobs" value={stats.totalJobs} icon="briefcase" />
        <StatsCard
          title="Applications"
          value={stats.totalApplications}
          icon="file-text"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Invite codes"
          value={stats.recruiterInvites.total}
          icon="users"
          description={`${stats.recruiterInvites.available} available · ${stats.recruiterInvites.used} used`}
        />
        <StatsCard
          title="Available codes"
          value={stats.recruiterInvites.available}
          icon="file-text"
        />
        <StatsCard
          title="Used codes"
          value={stats.recruiterInvites.used}
          icon="file-text"
        />
      </div>

      <SectionCard
        title="Jobs & application pipeline"
        description={`${stats.totalJobs} job(s) posted by your recruiters`}
      >
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No jobs posted yet. Recruiters can create jobs after joining with an
            invite code.
          </p>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{job.title}</h3>
                  <Badge variant="secondary">
                    {job.applicationCount} application
                    {job.applicationCount === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {APPLICATION_STATUSES.map((status) => (
                    <Badge key={status} variant="outline" className="text-xs">
                      {STATUS_LABELS[status]}: {job.statusBreakdown[status]}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead className="text-right">Applications</TableHead>
                  {APPLICATION_STATUSES.map((s) => (
                    <TableHead key={s} className="text-right text-xs">
                      {STATUS_LABELS[s]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell className="text-right">
                      {job.applicationCount}
                    </TableCell>
                    {APPLICATION_STATUSES.map((status) => (
                      <TableCell key={status} className="text-right text-muted-foreground">
                        {job.statusBreakdown[status]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
