import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { ensureCurrentUser } from "@/lib/auth/setup-user";

/** Current user from PostgreSQL (by Clerk session id). */
export async function getDbUser() {
  const session = await auth();
  if (!session.userId) return null;

  return prisma.user.findUnique({
    where: { clerkId: session.userId },
  });
}

/** Requires a DB user; creates/syncs candidate row if webhook has not run yet. */
export async function requireDbUser() {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }

  const user = await ensureCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }
  return session.userId;
}

/** Enforce role from Prisma only (layouts / server pages). */
export async function requireRole(allowedRoles: Role[]) {
  const user = await requireDbUser();

  if (!user.role || !allowedRoles.includes(user.role)) {
    redirect("/forbidden");
  }

  return user;
}
