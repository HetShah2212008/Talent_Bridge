"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function JobSearch({ defaultQuery = "" }: { defaultQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(defaultQuery);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    router.push(`/candidate/jobs?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full max-w-xl">
      <div className="relative flex-1">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Try "sd", "react frontend", or "machine learning"'
          className="pl-9"
        />
      </div>
      <Button type="submit">AI Search</Button>
    </form>
  );
}
