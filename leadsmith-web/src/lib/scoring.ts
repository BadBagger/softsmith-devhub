export interface ScoreInput {
  hasWebsite: boolean;
  rating: number | null;
  ratingCount: number | null;
}

export interface ScoreResult {
  score: number;
  reasons: string[];
}

/**
 * Higher score = better pitch target for a new website. No-website businesses
 * are the core value prop, so that signal dominates; weak online presence
 * (few/low reviews) is a secondary nudge, not a standalone qualifier.
 */
export function scoreLead({ hasWebsite, rating, ratingCount }: ScoreInput): ScoreResult {
  const reasons: string[] = [];
  let score = 0;

  if (!hasWebsite) {
    score += 70;
    reasons.push("No website listed");
  } else {
    reasons.push("Already has a website");
  }

  if (ratingCount !== null && ratingCount < 10) {
    score += 15;
    reasons.push("Low review count (weak online presence)");
  }

  if (rating !== null && rating < 4.0) {
    score += 15;
    reasons.push("Rating under 4.0");
  }

  if (ratingCount === null && rating === null) {
    score += 10;
    reasons.push("No review data found");
  }

  return { score: Math.min(score, 100), reasons };
}
