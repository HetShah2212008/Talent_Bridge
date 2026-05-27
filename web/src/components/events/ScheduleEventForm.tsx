"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { scheduleEvent } from "@/lib/actions/events";
import { toast } from "sonner";

export function ScheduleEventForm({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await scheduleEvent(applicationId, formData);
      toast.success("Event scheduled");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Event type</Label>
          <Select id="type" name="type" defaultValue="OA" required>
            <option value="OA">OA Test</option>
            <option value="INTERVIEW">Interview</option>
            <option value="MEETING">Meeting</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Technical OA" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="scheduledAt">Date & time</Label>
        <Input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="meetingLink">Meeting link</Label>
        <Input id="meetingLink" name="meetingLink" placeholder="https://meet.google.com/..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea id="instructions" name="instructions" rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="updateStatus" value="true" defaultChecked />
        Update application status to match event type
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Scheduling..." : "Schedule Event"}
      </Button>
    </form>
  );
}
