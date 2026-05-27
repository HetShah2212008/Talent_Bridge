"use client";

import { ButtonLink } from "@/components/ui/button-link";

/** Routes to Prisma role dashboard via /dashboard. */
export function DashboardLink() {
  return (
    <ButtonLink href="/dashboard" variant="outline">
      Dashboard
    </ButtonLink>
  );
}
