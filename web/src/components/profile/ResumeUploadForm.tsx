"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveResumeText, saveResumeFromPdf } from "@/lib/actions/resume";
import { FileText, Upload } from "lucide-react";

export function ResumeUploadForm({
  hasResume,
  preview,
  resumeUrl,
}: {
  hasResume: boolean;
  preview?: string | null;
  resumeUrl?: string | null;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await saveResumeText(text);
      setSuccess("Resume saved. AI embedding generated for matching.");
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function handlePdfSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const formData = new FormData(e.currentTarget);
    try {
      const result = await saveResumeFromPdf(formData);
      setSuccess(
        result.resumeUrl
          ? "Resume uploaded successfully. Recruiters can now view/download your PDF."
          : "PDF parsed and embedded successfully."
      );
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {hasResume && preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Current resume (preview)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-6 whitespace-pre-wrap">
              {preview}
            </p>
            {resumeUrl && (
              <div className="pt-3 flex gap-2">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline"
                >
                  View uploaded PDF
                </a>
                <a href={resumeUrl} download className="text-xs text-primary underline">
                  Download PDF
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Paste resume text</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume">Resume content</Label>
              <Textarea
                id="resume"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your resume text here (skills, experience, education)..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Save & Generate Embedding"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload PDF resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePdfSubmit} className="space-y-4">
            <input
              type="file"
              name="file"
              accept="application/pdf"
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-muted file:font-medium"
            />
            <Button type="submit" variant="outline" disabled={loading}>
              Upload PDF
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
    </div>
  );
}
