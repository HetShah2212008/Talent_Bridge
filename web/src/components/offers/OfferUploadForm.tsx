"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadOfferLetter } from "@/lib/actions/offers";
import { toast } from "sonner";

export function OfferUploadForm({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await uploadOfferLetter(applicationId, formData);
      toast.success("Offer letter uploaded");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
      <input
        type="file"
        name="file"
        accept="application/pdf"
        required
        className="text-sm flex-1"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload Offer PDF"}
      </Button>
    </form>
  );
}
