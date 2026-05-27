import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">401</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Unauthorized</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Please sign in to access this page.
        </p>
        <Button variant="outline">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
