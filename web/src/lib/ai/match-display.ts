/** UI tiers for hybrid match percentages returned by the AI service. */
export type MatchTier = "strong" | "medium" | "weak";

export const MIN_VISIBLE_MATCH_PERCENT = 40;

export function getMatchTier(percent: number): MatchTier {
  if (percent >= 80) return "strong";
  if (percent >= 50) return "medium";
  return "weak";
}

export function getMatchTierLabel(percent: number): string {
  const tier = getMatchTier(percent);
  if (tier === "strong") return "Strong match";
  if (tier === "medium") return "Good match";
  return "Possible match";
}

export function isVisibleMatchPercent(percent: number | undefined): boolean {
  return percent != null && percent >= MIN_VISIBLE_MATCH_PERCENT;
}
