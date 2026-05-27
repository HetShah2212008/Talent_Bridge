import { Role } from "@prisma/client";

/** Aligns with Prisma `Role` enum — single source of truth in the database. */
export { Role as UserRole };
export type { Role };

export type AuthSession = {
  userId: string | null;
  role: Role | null;
  isAuthenticated: boolean;
};
