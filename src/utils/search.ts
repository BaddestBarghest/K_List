import levenshtein from "fast-levenshtein";
import type { Kink } from "../types";

export interface SearchResult {
  kink: Kink;
  distance: number;
}

// Fuzzy match: scores each word of the kink name/category against the query and keeps
// the best (lowest) distance, so partial/misspelled queries still surface close matches.
export function fuzzySearch(query: string, kinks: Kink[], limit = 8): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = kinks.map((kink) => {
    const name = kink.name.toLowerCase();
    let best = levenshtein.get(q, name);
    if (name.includes(q)) best = Math.min(best, 0);
    for (const word of name.split(/\s+/)) {
      best = Math.min(best, levenshtein.get(q, word));
    }
    return { kink, distance: best };
  });

  const maxDistance = Math.min(3, Math.max(1, Math.ceil(q.length / 4)));
  return scored
    .filter((r) => r.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
