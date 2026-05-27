-- AlterTable: add company and skills; backfill existing rows
ALTER TABLE "Job" ADD COLUMN "company" TEXT NOT NULL DEFAULT 'Company';
ALTER TABLE "Job" ADD COLUMN "skills" TEXT NOT NULL DEFAULT '';
