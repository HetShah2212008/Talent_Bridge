import prisma from "@/lib/prisma";
import { withDatabase } from "@/lib/db-handler";
import { Role } from "@prisma/client";

export type AdminStatsResponse = {
  users: {
    total: number;
    candidates: number;
    recruiters: number;
    companies: number;
  };
  jobs: {
    total: number;
    withApplications: Array<{
      id: string;
      title: string;
      applicationCount: number;
    }>;
  };
  applications: {
    total: number;
  };
};

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return withDatabase(async () => {
  const [
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalCompanies,
    totalJobs,
    totalApplications,
    jobsWithCounts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.CANDIDATE } }),
    prisma.user.count({ where: { role: Role.RECRUITER } }),
    prisma.user.count({ where: { role: Role.COMPANY } }),
    prisma.job.count(),
    prisma.application.count(),
    prisma.job.findMany({
      select: {
        id: true,
        title: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      candidates: totalCandidates,
      recruiters: totalRecruiters,
      companies: totalCompanies,
    },
    jobs: {
      total: totalJobs,
      withApplications: jobsWithCounts.map((job) => ({
        id: job.id,
        title: job.title,
        applicationCount: job._count.applications,
      })),
    },
    applications: {
      total: totalApplications,
    },
  };
  });
}
