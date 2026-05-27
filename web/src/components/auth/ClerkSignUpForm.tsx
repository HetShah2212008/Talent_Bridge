"use client";

import { SignUp } from "@clerk/nextjs";
import { authAppearance } from "@/lib/auth/appearance";

export function ClerkSignUpForm() {
  return (
    <SignUp
      appearance={authAppearance}
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl="/dashboard"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
