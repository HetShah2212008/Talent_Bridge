"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function GenerateRecruiterCodeButton({
  onGenerated,
}: {
  onGenerated?: (code: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/recruiter/invite", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate code");
      }
      setLastCode(data.code);
      onGenerated?.(data.code);
      toast.success(`Recruiter code: ${data.code}`);
      window.dispatchEvent(new CustomEvent("company-dashboard-refresh"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating…" : "Generate Recruiter ID"}
      </Button>
      {lastCode && (
        <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md border">
          {lastCode}
        </p>
      )}
    </div>
  );
}
