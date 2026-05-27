"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createJob, updateJob } from "@/lib/actions/jobs";
import { toast } from "sonner";

type JobFormProps = {
  mode?: "create" | "edit";
  jobId?: string;
  initial?: {
    title: string;
    company: string;
    description: string;
    skills: string;
    location?: string | null;
    salary?: string | null;
  };
  onCancel?: () => void;
};

export function JobForm({
  mode = "create",
  jobId,
  initial,
  onCancel,
}: JobFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      if (mode === "edit" && jobId) {
        await updateJob(jobId, formData);
        toast.success("Job updated");
      } else {
        await createJob(formData);
        toast.success("Job posted");
        (e.target as HTMLFormElement).reset();
      }
      onCancel?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "edit" ? "Edit Job" : "Post a New Job"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={initial?.title}
                placeholder="Frontend Developer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                name="company"
                required
                defaultValue={initial?.company}
                placeholder="Acme Inc."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={initial?.description}
              placeholder="Role overview, responsibilities, requirements..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills *</Label>
            <Input
              id="skills"
              name="skills"
              required
              defaultValue={initial?.skills}
              placeholder="React, TypeScript, Node.js"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={initial?.location ?? ""}
                placeholder="Remote / New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input
                id="salary"
                name="salary"
                defaultValue={initial?.salary ?? ""}
                placeholder="$60k - $80k"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : mode === "edit"
                  ? "Update Job"
                  : "Create Job"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
