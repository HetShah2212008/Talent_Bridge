"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Sparkles, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobForm } from "./JobForm";
import { deleteJob } from "@/lib/actions/jobs";
import { toast } from "sonner";

export type JobItem = {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string;
  location: string | null;
  salary: string | null;
  createdAt: Date;
  _count?: { applications: number };
};

export function JobList({ jobs }: { jobs: JobItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this job and all its applications?")) return;
    setDeletingId(id);
    try {
      await deleteJob(id);
      toast.success("Job deleted");
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  const editingJob = jobs.find((j) => j.id === editingId);

  if (editingJob) {
    return (
      <JobForm
        mode="edit"
        jobId={editingJob.id}
        initial={editingJob}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  return (
    <>
      <div className="hidden md:block rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No jobs yet. Create your first job above.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.location || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {job._count?.applications ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link
                      href={`/recruiter/jobs/${job.id}/applicants`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                      title="View applicants"
                    >
                      <Users className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/recruiter/jobs/${job.id}/matches`}
                      className={buttonVariants({ size: "sm", variant: "secondary" })}
                      title="AI matching candidates"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(job.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingId === job.id}
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {jobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No jobs yet. Create your first job above.
          </p>
        ) : (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
                <Badge variant="outline">{job.skills}</Badge>
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/recruiter/jobs/${job.id}/applicants`}
                    className={buttonVariants({ size: "sm", variant: "outline" })}
                  >
                    Applicants ({job._count?.applications ?? 0})
                  </Link>
                  <Link
                    href={`/recruiter/jobs/${job.id}/matches`}
                    className={buttonVariants({ size: "sm", variant: "secondary" })}
                  >
                    <Sparkles className="h-4 w-4 mr-1 inline" />
                    AI Matches
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(job.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deletingId === job.id}
                    onClick={() => handleDelete(job.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
