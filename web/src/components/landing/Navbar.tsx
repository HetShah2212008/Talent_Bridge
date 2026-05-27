"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ButtonLink } from "@/components/ui/button-link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { DashboardLink } from "@/components/landing/DashboardLink";
import { Briefcase } from "lucide-react";
import type { NavSessionInfo } from "@/lib/auth/display";
import { SIGN_IN_SWITCH_PATH } from "@/lib/auth/display";
import { NavSessionBadge } from "@/components/auth/NavSessionBadge";
import { AuthNavActions } from "@/components/auth/AuthNavActions";

export function LandingNavbar({
  session,
}: {
  session: NavSessionInfo | null;
}) {
  const signedIn = !!session;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 gap-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
          <Briefcase className="h-6 w-6 text-primary" />
          <span>TalentBridge</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#for-candidates" className="hover:text-foreground transition-colors">
            For Candidates
          </a>
          <a href="#for-recruiters" className="hover:text-foreground transition-colors">
            For Recruiters
          </a>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {session ? (
            <NavSessionBadge
              session={session}
              className="hidden md:flex"
            />
          ) : null}
          <ThemeToggle />
          {!signedIn && (
            <>
              <ButtonLink href={SIGN_IN_SWITCH_PATH} variant="ghost">
                Sign In
              </ButtonLink>
              <ButtonLink href="/sign-up">Get Started</ButtonLink>
            </>
          )}
          {signedIn && (
            <>
              <DashboardLink />
              <AuthNavActions compact />
              <UserButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
