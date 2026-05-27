import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withDatabase } from "@/lib/db-handler";
import { Role } from "@prisma/client";

/** Load authenticated user from PostgreSQL (never Clerk metadata). */
export async function getApiDbUser() {
  const session = await auth();
  if (!session.userId) return null;

  return withDatabase(() =>
    prisma.user.findUnique({
      where: { clerkId: session.userId },
    })
  );
}

export function jsonForbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function jsonUnauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireApiRole(allowed: Role[]) {
  const dbUser = await getApiDbUser();
  if (!dbUser) {
    return { error: jsonUnauthorized() } as const;
  }
  if (!dbUser.role || !allowed.includes(dbUser.role)) {
    return { error: jsonForbidden("Forbidden") } as const;
  }
  return { dbUser } as const;
}
