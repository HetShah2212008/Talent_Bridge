import prisma from "@/lib/prisma";
import { withDatabase } from "@/lib/db-handler";
import { ApplicationStatus, Role } from "@prisma/client";

export type JobStatusBreakdown = Record<ApplicationStatus, number>;

export type CompanyJobStats = {
  id: string;
  title: string;
  applicationCount: number;
  statusBreakdown: JobStatusBreakdown;
};

export type CompanyDashboardResponse = {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  recruiterInvites: {
    total: number;
    available: number;
    used: number;
  };
  jobs: CompanyJobStats[];
};

const EMPTY_BREAKDOWN = (): JobStatusBreakdown => ({
  APPLIED: 0,
  OA_SCHEDULED: 0,
  INTERVIEW: 0,
  SELECTED: 0,
  REJECTED: 0,
});

export async function getCompanyDashboardStats(
  companyId: string
): Promise<CompanyDashboardResponse> {
  return withDatabase(async () => {
    const recruiterFilter = {
      companyId,
      role: Role.RECRUITER,
    } as const;

    const jobWhere = { recruiter: recruiterFilter };

    const [
      totalRecruiters,
      totalUsers,
      totalJobs,
      totalApplications,
      inviteTotal,
      inviteAvailable,
      inviteUsed,
      jobs,
      statusGroups,
      distinctCandidates,
    ] = await Promise.all([
      prisma.user.count({ where: recruiterFilter }),
      prisma.user.count({
        where: {
          OR: [{ id: companyId }, { companyId }],
        },
      }),
      prisma.job.count({ where: jobWhere }),
      prisma.application.count({
        where: { job: jobWhere },
      }),
      prisma.recruiterInvite.count({ where: { companyId } }),
      prisma.recruiterInvite.count({
        where: { companyId, isUsed: false },
      }),
      prisma.recruiterInvite.count({
        where: { companyId, isUsed: true },
      }),
      prisma.job.findMany({
        where: jobWhere,
        select: {
          id: true,
          title: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.groupBy({
        by: ["jobId", "status"],
        where: { job: jobWhere },
        _count: { _all: true },
      }),
      prisma.application.findMany({
        where: { job: jobWhere },
        distinct: ["candidateId"],
        select: { candidateId: true },
      }),
    ]);

    const breakdownByJob = new Map<string, JobStatusBreakdown>();
    for (const row of statusGroups) {
      if (!breakdownByJob.has(row.jobId)) {
        breakdownByJob.set(row.jobId, EMPTY_BREAKDOWN());
      }
      const breakdown = breakdownByJob.get(row.jobId)!;
      breakdown[row.status] = row._count._all;
    }

    const jobStats: CompanyJobStats[] = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      applicationCount: job._count.applications,
      statusBreakdown: breakdownByJob.get(job.id) ?? EMPTY_BREAKDOWN(),
    }));

    return {
      totalUsers,
      totalCandidates: distinctCandidates.length,
      totalRecruiters,
      totalCompanies: 1,
      totalJobs,
      totalApplications,
      recruiterInvites: {
        total: inviteTotal,
        available: inviteAvailable,
        used: inviteUsed,
      },
      jobs: jobStats,
    };
  });
}
