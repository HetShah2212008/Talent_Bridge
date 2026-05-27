import { ApplyButton } from "@/components/jobs/ApplyButton";
import { MatchScoreBadge } from "@/components/ai/MatchScoreBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type JobCardProps = {
  job: {
    id: string;
    title: string;
    company: string;
    description: string;
    skills: string;
    location: string | null;
    salary: string | null;
    recruiter: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  alreadyApplied: boolean;
  matchPercent?: number;
};

export function JobCard({ job, alreadyApplied, matchPercent }: JobCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
          </div>
          {matchPercent != null && <MatchScoreBadge percent={matchPercent} />}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">{job.skills}</Badge>
          {job.location && <Badge variant="secondary">{job.location}</Badge>}
          {job.salary && <Badge variant="secondary">{job.salary}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-4">
          {job.description}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <ApplyButton
          jobId={job.id}
          jobTitle={job.title}
          alreadyApplied={alreadyApplied}
        />
      </CardFooter>
    </Card>
  );
}
