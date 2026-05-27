"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRoleLabel, type NavSessionInfo } from "@/lib/auth/display";

export function NavSessionBadge({
  session,
  className,
  align = "end",
}: {
  session: NavSessionInfo;
  className?: string;
  align?: "start" | "end";
}) {
  return (
    <div
      className={cn(
        "flex flex-col max-w-[220px]",
        align === "end" ? "items-end text-right" : "items-start text-left",
        className
      )}
    >
      <span className="text-xs text-muted-foreground truncate w-full">
        {session.email}
      </span>
      <Badge variant="outline" className="text-[10px] h-5 mt-0.5">
        {formatRoleLabel(session.role)}
      </Badge>
    </div>
  );
}
