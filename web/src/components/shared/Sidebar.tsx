"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItemConfig } from "@/config/navigation";
import { NavIcon } from "./nav-icons";
import type { NavSessionInfo } from "@/lib/auth/display";
import { NavSessionBadge } from "@/components/auth/NavSessionBadge";
import { AuthNavActions } from "@/components/auth/AuthNavActions";

export type NavItem = NavItemConfig;

interface SidebarProps {
  items: NavItem[];
  title?: string;
  session?: NavSessionInfo;
}

export function Sidebar({ items, title = "Dashboard", session }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex w-64 bg-background border-r h-full flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <NavIcon name={item.icon} className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {session ? (
        <div className="p-4 border-t space-y-3">
          <NavSessionBadge session={session} />
          <AuthNavActions compact />
        </div>
      ) : null}
    </div>
  );
}
