import Link from "next/link";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { displayName } from "@/lib/utils/user-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES, STATUS_LABELS } from "@/lib/constants/application";
import { ApplicationStatus } from "@prisma/client";

export type PipelineApplication = {
  id: string;
  status: ApplicationStatus;
  statusUpdatedAt: Date;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  job: { title: string; company: string };
  statusUpdatedBy: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

export function PipelineBoard({
  applications,
  manageHref,
}: {
  applications: PipelineApplication[];
  manageHref: (id: string) => string;
}) {
  const grouped = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = applications.filter((a) => a.status === stage);
      return acc;
    },
    {} as Record<ApplicationStatus, PipelineApplication[]>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      {PIPELINE_STAGES.map((stage) => (
        <Card key={stage} className="flex flex-col min-h-[200px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between">
              {STATUS_LABELS[stage]}
              <span className="text-muted-foreground font-normal">
                {grouped[stage].length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 flex-1">
            {grouped[stage].length === 0 ? (
              <p className="text-xs text-muted-foreground">No candidates</p>
            ) : (
              grouped[stage].map((app) => (
                <Link
                  key={app.id}
                  href={manageHref(app.id)}
                  className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium text-sm truncate">
                    {displayName(app.candidate)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {app.job.title} · {app.job.company}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <StatusBadge status={app.status} />
                  </div>
                  {app.statusUpdatedBy && (
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">
                      by {app.statusUpdatedBy.email}
                    </p>
                  )}
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
