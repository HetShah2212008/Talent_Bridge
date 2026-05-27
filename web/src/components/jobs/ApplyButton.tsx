"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ApplyButton({
  jobId,
  jobTitle,
  alreadyApplied,
}: {
  jobId: string;
  jobTitle: string;
  alreadyApplied: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(alreadyApplied);

  async function handleApply() {
    setLoading(true);
    try {
      const res = await fetch("/api/application/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to apply");
      }
      setApplied(true);
      toast.success(`Applied to ${data.jobTitle ?? jobTitle}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <Button disabled variant="secondary" className="w-full sm:w-auto">
        Applied
      </Button>
    );
  }

  return (
    <Button
      onClick={handleApply}
      disabled={loading}
      className="w-full sm:w-auto"
      aria-label={`Apply to ${jobTitle}`}
    >
      {loading ? "Applying..." : "Apply Now"}
    </Button>
  );
}
