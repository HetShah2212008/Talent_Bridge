import { ButtonLink } from "@/components/ui/button-link";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">403</h1>
        <h2 className="text-2xl font-semibold">Access forbidden</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your account does not have permission for this area. Candidates use the
          candidate portal; recruiters and admins are assigned in the database.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <ButtonLink href="/dashboard">Go to my dashboard</ButtonLink>
          <ButtonLink href="/sign-in?switch=1" variant="outline">
            Switch account
          </ButtonLink>
          <ButtonLink href="/" variant="outline">
            Home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
