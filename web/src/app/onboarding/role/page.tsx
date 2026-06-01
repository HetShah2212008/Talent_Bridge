"use client";

import { useActionState } from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "@/lib/actions/onboarding";

type Role = "CANDIDATE" | "COMPANY" | "RECRUITER";

const ROLES: {
  value: Role;
  label: string;
  description: string;
}[] = [
  {
    value: "CANDIDATE",
    label: "Candidate",
    description: "Find and apply to jobs",
  },
  {
    value: "COMPANY",
    label: "Company",
    description: "Post jobs and manage hiring",
  },
  {
    value: "RECRUITER",
    label: "Recruiter",
    description: "Review candidates and manage applications",
  },
];

export default function OnboardingRolePage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [state, formAction, isPending] = useActionState(completeOnboarding, null);

  const showCodeInput = selectedRole === "COMPANY" || selectedRole === "RECRUITER";
  const codeLabel =
    selectedRole === "COMPANY" ? "Company Registration Code" : "Recruiter Invite Code";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Welcome to TalentBridge</h1>
          <p className="text-muted-foreground">Choose your role to get started</p>
        </div>

        <form action={formAction} className="space-y-6">
          {/* Hidden role input */}
          <input type="hidden" name="role" value={selectedRole ?? ""} />

          {/* Role cards */}
          <div className="grid gap-3">
            {ROLES.map(({ value, label, description }) => (
              <Card
                key={value}
                onClick={() => setSelectedRole(value)}
                className={[
                  "cursor-pointer transition-all border-2",
                  selectedRole === value
                    ? "ring-2 ring-primary border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50",
                ].join(" ")}
              >
                <CardContent className="flex items-center gap-4 py-4 px-5">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  {/* Selection indicator */}
                  <div
                    className={[
                      "h-4 w-4 rounded-full border-2 shrink-0 transition-colors",
                      selectedRole === value
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40",
                    ].join(" ")}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Code input — shown only for Company and Recruiter */}
          {showCodeInput && (
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-sm font-medium text-foreground"
              >
                {codeLabel}
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder={`Enter your ${codeLabel.toLowerCase()}`}
                autoComplete="off"
                className="bg-background"
              />
            </div>
          )}

          {/* Hidden code input when not shown, so formData always has the key */}
          {!showCodeInput && <input type="hidden" name="code" value="" />}

          {/* Error message */}
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !selectedRole}
          >
            {isPending ? "Setting up your account…" : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
