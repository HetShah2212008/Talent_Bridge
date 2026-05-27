"use client";

import { SignIn } from "@clerk/nextjs";
import { authAppearance } from "@/lib/auth/appearance";

export function ClerkSignInForm() {
  return (
    <SignIn
      appearance={authAppearance}
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      forceRedirectUrl="/dashboard"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
