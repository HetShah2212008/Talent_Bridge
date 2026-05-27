"use client";

import {
  Briefcase,
  FileText,
  LayoutDashboard,
  MessageSquare,
  User,
  Users,
} from "lucide-react";
import type { NavIconKey } from "@/config/navigation";

export const navIconMap = {
  dashboard: LayoutDashboard,
  briefcase: Briefcase,
  users: Users,
  "file-text": FileText,
  "message-square": MessageSquare,
  user: User,
} satisfies Record<NavIconKey, typeof LayoutDashboard>;

export function NavIcon({
  name,
  className,
}: {
  name: NavIconKey;
  className?: string;
}) {
  const Icon = navIconMap[name];
  return <Icon className={className} />;
}
