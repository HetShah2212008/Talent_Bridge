"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { STATUS_LABELS, APPLICATION_STATUSES } from "@/lib/constants/application";
import { ApplicationStatus } from "@prisma/client";
import { toast } from "sonner";

export function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as ApplicationStatus;
    setLoading(true);
    try {
      const res = await fetch("/api/application/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update status");
      }
      setStatus(newStatus);
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="w-full max-w-[160px]"
    >
      {APPLICATION_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
