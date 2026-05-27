export type NavIconKey =
  | "dashboard"
  | "briefcase"
  | "users"
  | "file-text"
  | "message-square"
  | "user";

export type NavItemConfig = {
  label: string;
  href: string;
  icon: NavIconKey;
};

export const recruiterNavItems: NavItemConfig[] = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: "dashboard" },
  { label: "Jobs", href: "/recruiter/jobs", icon: "briefcase" },
  { label: "Candidates", href: "/recruiter/candidates", icon: "users" },
];

export const candidateNavItems: NavItemConfig[] = [
  { label: "Dashboard", href: "/candidate/dashboard", icon: "dashboard" },
  { label: "Browse Jobs", href: "/candidate/jobs", icon: "briefcase" },
  { label: "Applications", href: "/candidate/applications", icon: "file-text" },
  { label: "Messages", href: "/candidate/messages", icon: "message-square" },
  { label: "Profile", href: "/candidate/profile", icon: "user" },
];

export const companyNavItems: NavItemConfig[] = [
  { label: "Dashboard", href: "/company/dashboard", icon: "dashboard" },
];

export const adminNavItems: NavItemConfig[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Users", href: "/admin/users", icon: "users" },
];
