"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function RecruiterJoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Enter your recruiter code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/recruiter/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Activation failed");
      }
      toast.success(data.message ?? "Recruiter access granted");
      router.push(data.redirect ?? "/recruiter/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Activation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full">
      <div className="space-y-2">
        <Label htmlFor="recruiter-code">Recruiter code</Label>
        <Input
          id="recruiter-code"
          name="code"
          placeholder="RECR-XXXXXXXX"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="font-mono"
          autoComplete="off"
          required
        />
        <p className="text-xs text-muted-foreground">
          Ask your company admin for a code (format RECR-XXXXXXXX).
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Activating…" : "Activate recruiter account"}
      </Button>
    </form>
  );
}
