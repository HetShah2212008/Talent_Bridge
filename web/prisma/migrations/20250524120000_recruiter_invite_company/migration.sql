-- Add COMPANY role
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COMPANY';

-- Link recruiters to company user
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
CREATE INDEX IF NOT EXISTS "User_companyId_idx" ON "User"("companyId");

ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Recruiter invite codes
CREATE TABLE "RecruiterInvite" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruiterInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RecruiterInvite_code_key" ON "RecruiterInvite"("code");
CREATE INDEX "RecruiterInvite_companyId_idx" ON "RecruiterInvite"("companyId");

ALTER TABLE "RecruiterInvite" ADD CONSTRAINT "RecruiterInvite_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
