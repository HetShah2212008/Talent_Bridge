import { ButtonLink } from "@/components/ui/button-link";

export function DashboardSetupError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4 border rounded-xl p-8 bg-card shadow-sm">
        <h1 className="text-xl font-semibold">Account setup incomplete</h1>
        <p className="text-sm text-muted-foreground">
          User not found. Please sign in again.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <ButtonLink href="/dashboard">Retry</ButtonLink>
          <ButtonLink href="/sign-in?switch=1" variant="outline">
            Switch account
          </ButtonLink>
          <ButtonLink href="/" variant="ghost" size="sm">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
