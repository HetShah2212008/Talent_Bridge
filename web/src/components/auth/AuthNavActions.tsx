"use client";

import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@/components/auth/use-auth-actions";

export function AuthNavActions({ compact = false }: { compact?: boolean }) {
  const { signOutCompletely, switchAccount } = useAuthActions();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={switchAccount}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <UserRound className="h-4 w-4" />
        {!compact && <span className="hidden sm:inline">Switch account</span>}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={signOutCompletely}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        {!compact && <span className="hidden sm:inline">Log out</span>}
      </Button>
    </div>
  );
}
