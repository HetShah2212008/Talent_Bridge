import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMatchTier, getMatchTierLabel } from "@/lib/ai/match-display";

export function MatchScoreBadge({ percent }: { percent: number }) {
  const rounded = Math.round(Math.min(95, Math.max(8, percent)));
  const tier = getMatchTier(rounded);

  return (
    <Badge
      className={cn(
        "gap-1 border",
        tier === "strong" &&
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
        tier === "medium" &&
          "bg-primary/10 text-primary border-primary/20",
        tier === "weak" &&
          "bg-muted text-muted-foreground border-border"
      )}
      title={getMatchTierLabel(rounded)}
    >
      <Sparkles className="h-3 w-3 shrink-0" />
      <span>{rounded}%</span>
      <span className="hidden sm:inline opacity-80">
        {tier === "strong" ? "· Strong" : tier === "medium" ? "· Good" : "· Fair"}
      </span>
    </Badge>
  );
}
