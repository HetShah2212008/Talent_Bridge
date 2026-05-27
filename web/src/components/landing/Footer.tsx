import Link from "next/link";
import { Briefcase } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Briefcase className="h-5 w-5" />
              TalentBridge
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              AI-powered recruitment platform for connecting talent with opportunity.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/sign-up" className="hover:text-foreground">Sign Up</Link></li>
                <li><Link href="/sign-in" className="hover:text-foreground">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Roles</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Candidates</li>
                <li>Recruiters</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TalentBridge. College project demo.
        </p>
      </div>
    </footer>
  );
}
