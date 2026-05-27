-- Drop username column (no longer used; names only)
DROP INDEX IF EXISTS "User_username_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "username";
