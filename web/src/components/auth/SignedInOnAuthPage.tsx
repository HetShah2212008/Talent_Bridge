"use client";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { formatRoleLabel, type NavSessionInfo } from "@/lib/auth/display";
import { useAuthActions } from "@/components/auth/use-auth-actions";

export function SignedInOnAuthPage({
  session,
  alternateAuthHref,
  alternateAuthLabel,
}: {
  session: NavSessionInfo;
  alternateAuthHref?: string;
  alternateAuthLabel?: string;
}) {
  const { switchAccount } = useAuthActions();

  return (
    <div className="w-full max-w-md border rounded-xl p-6 bg-card shadow-sm space-y-4 text-center">
      <p className="text-sm text-muted-foreground">You are already signed in</p>
      <div className="space-y-1">
        <p className="text-sm font-medium break-all">{session.email}</p>
        <Badge variant="secondary">{formatRoleLabel(session.role)}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Dashboard access is determined by your database role, not Clerk metadata.
      </p>
      <div className="flex flex-col gap-2">
        <ButtonLink href="/dashboard" className="w-full">
          Continue to my dashboard
        </ButtonLink>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={switchAccount}
        >
          Switch account
        </Button>
        {alternateAuthHref && alternateAuthLabel ? (
          <ButtonLink href={alternateAuthHref} variant="ghost" size="sm">
            {alternateAuthLabel}
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}
