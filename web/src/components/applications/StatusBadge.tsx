import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants/application";
import { ApplicationStatus } from "@prisma/client";

const variants: Partial<
  Record<ApplicationStatus, "default" | "secondary" | "destructive" | "outline">
> = {
  APPLIED: "secondary",
  OA_SCHEDULED: "outline",
  INTERVIEW: "default",
  SELECTED: "default",
  REJECTED: "destructive",
};

export function StatusBadge({ status }: { status: ApplicationStatus | string }) {
  const key = status as ApplicationStatus;
  return (
    <Badge variant={variants[key] ?? "secondary"}>
      {STATUS_LABELS[key] ?? status}
    </Badge>
  );
}
