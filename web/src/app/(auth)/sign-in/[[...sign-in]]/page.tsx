import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Briefcase } from "lucide-react";
import { ClerkSignInForm } from "@/components/auth/ClerkSignInForm";
import { SignOutThenSignIn } from "@/components/auth/SignOutThenSignIn";
import { SignedInOnAuthPage } from "@/components/auth/SignedInOnAuthPage";
import { getDbUser } from "@/lib/auth/get-user";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ switch?: string }>;
}) {
  const { switch: switchParam } = await searchParams;
  const session = await auth();
  const isSwitch = switchParam === "1";

  const header = (
    <div className="w-full max-w-md mb-6 text-center space-y-2">
      <div className="inline-flex items-center gap-2 font-bold text-xl">
        <Briefcase className="h-6 w-6 text-primary" />
        TalentBridge
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-sm text-muted-foreground">
        Sign in to your account. Use &quot;Switch account&quot; to test a different
        role.
      </p>
    </div>
  );

  if (session.userId && !isSwitch) {
    const dbUser = await getDbUser();
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
        {header}
        <SignedInOnAuthPage
          session={{
            email: dbUser?.email ?? "Signed-in user",
            role: dbUser?.role ?? null,
          }}
          alternateAuthHref="/sign-up?switch=1"
          alternateAuthLabel="Create a new account instead"
        />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Have a company recruiter code?{" "}
          <Link
            href="/recruiter-join"
            className="text-primary underline font-medium"
          >
            Activate recruiter access
          </Link>
        </p>
      </div>
    );
  }

  const signInForm = (
    <>
      {header}
      <ClerkSignInForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Have a company recruiter code?{" "}
        <Link
          href="/recruiter-join"
          className="text-primary underline font-medium"
        >
          Activate recruiter access
        </Link>
      </p>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {session.userId && isSwitch ? (
        <SignOutThenSignIn>{signInForm}</SignOutThenSignIn>
      ) : (
        signInForm
      )}
    </div>
  );
}
