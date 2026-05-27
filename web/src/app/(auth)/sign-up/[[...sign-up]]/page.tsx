import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Briefcase } from "lucide-react";
import { ClerkSignUpForm } from "@/components/auth/ClerkSignUpForm";
import { SignOutThenSignIn } from "@/components/auth/SignOutThenSignIn";
import { SignedInOnAuthPage } from "@/components/auth/SignedInOnAuthPage";
import { getDbUser } from "@/lib/auth/get-user";

export default async function SignUpPage({
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
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Job seeker signup — first name and last name are required. Recruiters sign
        in with credentials from their company.
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
          alternateAuthHref="/sign-in?switch=1"
          alternateAuthLabel="Sign in with a different account"
        />
      </div>
    );
  }

  const signUpForm = (
    <>
      {header}
      <ClerkSignUpForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in?switch=1" className="text-primary underline">
          Sign in with another account
        </Link>
      </p>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {session.userId && isSwitch ? (
        <SignOutThenSignIn>{signUpForm}</SignOutThenSignIn>
      ) : (
        signUpForm
      )}
    </div>
  );
}
