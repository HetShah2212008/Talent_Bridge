import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { ApplicationStatusSelect } from "@/components/applications/ApplicationStatusSelect";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireDbUser } from "@/lib/auth/get-user";
import { getJobApplicantsWorkflow } from "@/lib/workflows/jobs";

type PageProps = { params: Promise<{ jobId: string }> };

export default async function JobApplicantsPage({ params }: PageProps) {
  const { jobId } = await params;
  const user = await requireDbUser();

  let data;
  try {
    data = await getJobApplicantsWorkflow(user, jobId);
  } catch {
    notFound();
  }

  const { job, applicants } = data;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={`Applicants: ${job.title}`}
        description={`${job.company} · ${job.applicationCount} application(s)`}
      >
        <ButtonLink href="/recruiter/jobs" variant="outline">
          Back to jobs
        </ButtonLink>
      </DashboardHeader>

      {applicants.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No applications for this job yet.
        </p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((row) => (
                <TableRow key={row.applicationId}>
                  <TableCell className="font-medium">
                    {row.candidate.displayName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.candidate.email}
                  </TableCell>
                  <TableCell>
                    {row.candidate.hasResume ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">On file</Badge>
                        {row.candidate.resumeUrl && (
                          <>
                            <a
                              href={row.candidate.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary underline"
                            >
                              View
                            </a>
                            <a
                              href={row.candidate.resumeUrl}
                              download
                              className="text-xs text-primary underline"
                            >
                              Download
                            </a>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusSelect
                      applicationId={row.applicationId}
                      currentStatus={row.status}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <ButtonLink
                      href={`/recruiter/applications/${row.applicationId}`}
                      size="sm"
                      variant="outline"
                    >
                      View
                    </ButtonLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
