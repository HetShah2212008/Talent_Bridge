import { ApplicationStatus } from "@prisma/client";

export const APPLICATION_STATUSES = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.OA_SCHEDULED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.SELECTED,
  ApplicationStatus.REJECTED,
] as const;

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  OA_SCHEDULED: "OA Scheduled",
  INTERVIEW: "Interview",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

export const PIPELINE_STAGES = APPLICATION_STATUSES;

const PIPELINE_ORDER: ApplicationStatus[] = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.OA_SCHEDULED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.SELECTED,
];

/** Forward-only pipeline; REJECTED allowed from any non-terminal stage. */
export function isValidStatusTransition(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  if (from === to) return true;
  if (to === ApplicationStatus.REJECTED) {
    return from !== ApplicationStatus.REJECTED && from !== ApplicationStatus.SELECTED;
  }
  if (from === ApplicationStatus.REJECTED || from === ApplicationStatus.SELECTED) {
    return false;
  }
  const fromIdx = PIPELINE_ORDER.indexOf(from);
  const toIdx = PIPELINE_ORDER.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx === fromIdx + 1;
}
