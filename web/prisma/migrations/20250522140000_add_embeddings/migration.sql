-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN "resumeText" TEXT,
ADD COLUMN "embedding" JSONB;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN "embedding" JSONB;
