import { Role } from "@prisma/client";

export const SIGN_IN_SWITCH_PATH = "/sign-in?switch=1";
export const SIGN_UP_SWITCH_PATH = "/sign-up?switch=1";

export type NavSessionInfo = {
  email: string;
  role: Role | null;
};

const ROLE_LABELS: Record<Role, string> = {
  CANDIDATE: "Candidate",
  RECRUITER: "Recruiter",
  COMPANY: "Company",
  ADMIN: "Admin",
};

export function formatRoleLabel(role: Role | null | undefined): string {
  if (!role) return "No role";
  return ROLE_LABELS[role] ?? role;
}
