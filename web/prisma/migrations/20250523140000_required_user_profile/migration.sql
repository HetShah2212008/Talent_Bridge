-- Add username column and backfill existing rows before NOT NULL constraints
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;

UPDATE "User"
SET
  "firstName" = COALESCE(NULLIF(TRIM("firstName"), ''), 'Unknown'),
  "lastName" = COALESCE(NULLIF(TRIM("lastName"), ''), 'User'),
  "username" = COALESCE(NULLIF(TRIM("username"), ''), 'user_' || "id")
WHERE "firstName" IS NULL
   OR "lastName" IS NULL
   OR "username" IS NULL
   OR TRIM("firstName") = ''
   OR TRIM("lastName") = ''
   OR TRIM("username") = '';

ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
