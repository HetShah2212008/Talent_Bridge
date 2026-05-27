import {
  ArrowRight,
  Briefcase,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingNavbarShell } from "@/components/landing/LandingNavbarShell";
import { LandingFooter } from "@/components/landing/Footer";

export default async function HomePage() {
  const session = await auth();
  if (session.userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbarShell />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="container relative mx-auto px-4 md:px-6 py-20 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-Powered Recruitment Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                Connect Talent with{" "}
                <span className="text-primary">Opportunity</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                TalentBridge helps recruiters post jobs and manage applicants while
                candidates discover roles and track applications — all in one polished platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <ButtonLink href="/sign-up" size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/sign-in" size="lg" variant="outline">
                  Sign In
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Everything You Need</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                A complete recruitment workflow built for demos, portfolios, and real use.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Briefcase,
                  title: "Job Management",
                  desc: "Recruiters create, edit, and manage job postings with real database storage.",
                },
                {
                  icon: Search,
                  title: "Smart Job Discovery",
                  desc: "Candidates browse and search open roles, then apply with one click.",
                },
                {
                  icon: Zap,
                  title: "Application Tracking",
                  desc: "Track application status from pending to accepted across both dashboards.",
                },
              ].map((f) => (
                <Card key={f.title} className="border-2 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="for-candidates" className="py-20 bg-muted/30 border-y">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold">For Candidates</h2>
                <p className="mt-4 text-muted-foreground">
                  Browse open positions, apply instantly, and monitor your application
                  status from a clean personal dashboard.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Browse & search jobs", "One-click applications", "Track application status"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary shrink-0" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
                <ButtonLink href="/sign-up" className="mt-8">
                  Join as Candidate
                </ButtonLink>
              </div>
              <Card className="p-6 bg-card shadow-lg">
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted/60 rounded" />
                  <div className="h-3 w-5/6 bg-muted/60 rounded" />
                  <Button className="w-full mt-4" disabled>
                    Apply Now
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="for-recruiters" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <Card className="p-6 bg-card shadow-lg order-2 md:order-1">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Active Jobs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">48</p>
                    <p className="text-xs text-muted-foreground">Applicants</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-xs text-muted-foreground">New Today</p>
                  </div>
                </div>
              </Card>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl font-bold">For Recruiters</h2>
                <p className="mt-4 text-muted-foreground">
                  Post jobs, review applicants, and update application status — all
                  from a recruiter dashboard powered by PostgreSQL.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Create & manage job posts", "View all applicants", "Update application status"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-primary shrink-0" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
                <ButtonLink href="/sign-in" variant="outline" className="mt-8">
                  Recruiter Sign In
                </ButtonLink>
                <p className="text-xs text-muted-foreground mt-2">
                  Recruiter accounts are issued by your organization.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
            <p className="mt-4 opacity-90 max-w-lg mx-auto">
              Sign up as a candidate in seconds and start applying with AI-powered job matching.
            </p>
            <ButtonLink href="/sign-up" size="lg" variant="secondary" className="mt-8">
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
