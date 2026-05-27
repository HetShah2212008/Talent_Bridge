-- DropIndex
DROP INDEX "User_onboardingCompleted_idx";

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "company" DROP DEFAULT,
ALTER COLUMN "skills" DROP DEFAULT;
