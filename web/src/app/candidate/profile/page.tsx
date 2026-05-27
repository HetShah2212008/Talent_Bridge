import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ResumeUploadForm } from "@/components/profile/ResumeUploadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDbUser } from "@/lib/auth/get-user";
import { getCandidateProfile } from "@/lib/auth/candidate-profile";
import { displayName } from "@/lib/utils/user-display";

export default async function CandidateProfilePage() {
  const user = await requireDbUser();
  const profile = await getCandidateProfile(user.id);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Profile & Resume"
        description="Upload your resume for AI-powered job matching and semantic search."
      />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Personal Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{displayName(user)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">AI embedding</span>
            <span className="font-medium">
              {profile?.embedding ? "Ready" : "Not generated"}
            </span>
          </div>
        </CardContent>
      </Card>

      <ResumeUploadForm
        hasResume={!!profile?.resumeText || !!profile?.resumeUrl}
        preview={profile?.resumeText?.slice(0, 400) ?? null}
        resumeUrl={profile?.resumeUrl ?? null}
      />
    </div>
  );
}
