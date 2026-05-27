"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavItem } from "./Sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { NavIcon } from "./nav-icons";
import type { NavSessionInfo } from "@/lib/auth/display";
import { NavSessionBadge } from "@/components/auth/NavSessionBadge";
import { AuthNavActions } from "@/components/auth/AuthNavActions";

interface TopNavProps {
  title?: string;
  items?: NavItem[];
  session?: NavSessionInfo;
}

export function TopNav({ title, items = [], session }: TopNavProps) {
  const pathname = usePathname();

  return (
    <header className="h-16 bg-background border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 gap-2">
      <div className="flex items-center gap-4 min-w-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground">
                {title || "Dashboard"}
              </h2>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
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
                <NavSessionBadge session={session} align="start" />
                <AuthNavActions compact />
              </div>
            ) : null}
          </SheetContent>
        </Sheet>
        <div className="font-semibold text-foreground md:text-lg truncate">
          {title}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {session ? (
          <NavSessionBadge session={session} className="hidden lg:flex" />
        ) : null}
        <ThemeToggle />
        <AuthNavActions />
        <div className="md:hidden flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
