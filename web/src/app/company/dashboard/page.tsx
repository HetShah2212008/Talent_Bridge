import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { GenerateRecruiterCodeButton } from "@/components/company/GenerateRecruiterCodeButton";
import { CompanyDashboardAnalytics } from "@/components/company/CompanyDashboardAnalytics";
import { requireDbUser } from "@/lib/auth/get-user";
import { displayName } from "@/lib/utils/user-display";
import prisma from "@/lib/prisma";
import { isPrismaConnectionError } from "@/lib/prisma-errors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Role } from "@prisma/client";

export default async function CompanyDashboardPage() {
  const user = await requireDbUser();

  let invites: Awaited<
    ReturnType<typeof prisma.recruiterInvite.findMany>
  > = [];
  let recruiters: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  let listsError: string | null = null;

  try {
    [invites, recruiters] = await Promise.all([
      prisma.recruiterInvite.findMany({
        where: { companyId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.user.findMany({
        where: { companyId: user.id, role: Role.RECRUITER },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);
  } catch (err) {
    console.error("[company/dashboard] lists", err);
    if (isPrismaConnectionError(err)) {
      listsError =
        "Database temporarily unavailable. Invite lists could not be loaded.";
    } else {
      listsError = "Failed to load invite and recruiter lists.";
    }
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Company Dashboard"
        description={`Welcome, ${displayName(user)}. Manage recruiters and track hiring activity.`}
      />

      <CompanyDashboardAnalytics />

      <SectionCard
        title="Generate recruiter invite"
        description="Share the code with a new recruiter. Each code can be used once."
      >
        <GenerateRecruiterCodeButton />
      </SectionCard>

      {listsError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {listsError}
        </div>
      ) : null}

      <SectionCard title="Recent invite codes">
        {invites.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No codes generated yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm">{inv.code}</TableCell>
                  <TableCell>
                    <Badge variant={inv.isUsed ? "secondary" : "default"}>
                      {inv.isUsed ? "Used" : "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(inv.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <SectionCard title="Active recruiters">
        {recruiters.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No recruiters activated yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recruiters.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{displayName(r)}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
