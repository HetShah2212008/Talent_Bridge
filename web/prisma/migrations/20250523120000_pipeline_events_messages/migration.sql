-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'OA_SCHEDULED', 'INTERVIEW', 'SELECTED', 'REJECTED');
CREATE TYPE "EventType" AS ENUM ('OA', 'INTERVIEW', 'MEETING');

-- AlterTable Application
ALTER TABLE "Application" ADD COLUMN "statusUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Application" ADD COLUMN "statusUpdatedById" TEXT;
ALTER TABLE "Application" ADD COLUMN "offerLetterPath" TEXT;
ALTER TABLE "Application" ADD COLUMN "offerLetterUploadedAt" TIMESTAMP(3);

-- Migrate status column to enum
ALTER TABLE "Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus" USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'APPLIED'::"ApplicationStatus"
    WHEN 'REVIEWING' THEN 'OA_SCHEDULED'::"ApplicationStatus"
    WHEN 'ACCEPTED' THEN 'SELECTED'::"ApplicationStatus"
    WHEN 'REJECTED' THEN 'REJECTED'::"ApplicationStatus"
    WHEN 'APPLIED' THEN 'APPLIED'::"ApplicationStatus"
    WHEN 'OA_SCHEDULED' THEN 'OA_SCHEDULED'::"ApplicationStatus"
    WHEN 'INTERVIEW' THEN 'INTERVIEW'::"ApplicationStatus"
    WHEN 'SELECTED' THEN 'SELECTED'::"ApplicationStatus"
    ELSE 'APPLIED'::"ApplicationStatus"
  END
);
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'APPLIED';

-- CreateTable Event
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "meetingLink" TEXT,
    "instructions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable Message
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");
CREATE INDEX "Event_candidateId_scheduledAt_idx" ON "Event"("candidateId", "scheduledAt");
CREATE INDEX "Event_applicationId_idx" ON "Event"("applicationId");
CREATE INDEX "Message_applicationId_createdAt_idx" ON "Message"("applicationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_statusUpdatedById_fkey" FOREIGN KEY ("statusUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Event" ADD CONSTRAINT "Event_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
