import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

type DbUser = { id: string; role: Role | null };

export async function canManageJob(
  dbUser: DbUser,
  job: { recruiterId: string; recruiter?: { companyId: string | null } | null }
): Promise<boolean> {
  if (!dbUser.role) return false;
  if (dbUser.role === Role.ADMIN) return true;
  if (dbUser.role === Role.RECRUITER && job.recruiterId === dbUser.id) return true;
  if (dbUser.role === Role.COMPANY) {
    let companyId = job.recruiter?.companyId;
    if (companyId === undefined) {
      const recruiter = await prisma.user.findUnique({
        where: { id: job.recruiterId },
        select: { companyId: true },
      });
      companyId = recruiter?.companyId ?? null;
    }
    return companyId === dbUser.id;
  }
  return false;
}

export async function loadApplicationForManage(applicationId: string) {
  return prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          recruiter: { select: { id: true, companyId: true } },
        },
      },
      candidate: {
        include: {
          candidateProfile: true,
        },
      },
    },
  });
}

export async function canManageApplication(dbUser: DbUser, applicationId: string) {
  const application = await loadApplicationForManage(applicationId);
  if (!application) return { allowed: false as const, application: null };
  const allowed = await canManageJob(dbUser, {
    recruiterId: application.job.recruiterId,
    recruiter: application.job.recruiter,
  });
  return { allowed, application };
}
