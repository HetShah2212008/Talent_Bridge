"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

/**
 * Clears an existing Clerk session when landing on sign-in with ?switch=1,
 * then renders children (Clerk SignIn) without auto-redirecting.
 */
export function SignOutThenSignIn({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setReady(true);
      return;
    }

    let cancelled = false;
    signOut()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, signOut]);

  if (!isLoaded || !ready) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Clearing previous session…
      </p>
    );
  }

  return <>{children}</>;
}
