"use client";

import { useClerk } from "@clerk/nextjs";
import { SIGN_IN_SWITCH_PATH } from "@/lib/auth/display";

/** Full Clerk session clear + redirect (testing / logout). */
export function useAuthActions() {
  const { signOut } = useClerk();

  function signOutCompletely() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    signOut({ redirectUrl: `${origin}/` });
  }

  /** Clears session before sign-in so a different account can be used. */
  function switchAccount() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    signOut({ redirectUrl: `${origin}${SIGN_IN_SWITCH_PATH}` });
  }

  return { signOutCompletely, switchAccount };
}
