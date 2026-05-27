"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CompanyAnalyticsView } from "@/components/company/CompanyAnalyticsView";
import type { CompanyDashboardResponse } from "@/lib/company/stats";

type LoadState = "loading" | "ready" | "error";

export function CompanyDashboardAnalytics() {
  const [stats, setStats] = useState<CompanyDashboardResponse | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/company/dashboard", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load analytics");
      }
      setStats(data as CompanyDashboardResponse);
      setState("ready");
    } catch (err) {
      setStats(null);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load analytics"
      );
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("company-dashboard-refresh", onRefresh);
    return () =>
      window.removeEventListener("company-dashboard-refresh", onRefresh);
  }, [load]);

  if (state === "loading") {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Loading company analytics…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 space-y-3 text-center">
        <p className="text-sm text-destructive font-medium">
          Could not load analytics
        </p>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <Button type="button" variant="outline" size="sm" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No analytics data available.
      </div>
    );
  }

  return <CompanyAnalyticsView stats={stats} />;
}
