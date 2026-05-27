/**
 * @deprecated Import from `@/lib/auth/get-user` instead.
 * Kept for backwards compatibility — Prisma is the only source of truth for roles.
 */
export {
  getDbUser as getDatabaseUser,
  getDbUser,
  requireDbUser,
  requireAuth,
  requireRole,
} from "@/lib/auth/get-user";
