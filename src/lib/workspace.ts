import type { Me, RepoSummary } from "@/lib/api/types";

/** The score the sign-off needs at least. Reaching it is not enough: no high findings and a complete scan are needed too. */
export const SIGN_OFF_SCORE = 80;

export type Delta = { kind: "first" } | { kind: "same" } | { kind: "up" | "down"; by: number };

/** How the latest score compares with the first one, so the row can say it in words. */
export function scoreDelta(scores: number[]): Delta {
  if (scores.length < 2) return { kind: "first" };
  const by = scores[scores.length - 1] - scores[0];
  if (by === 0) return { kind: "same" };
  return { kind: by > 0 ? "up" : "down", by: Math.abs(by) };
}

export type Domain = { lo: number; hi: number };

/**
 * The score range a small chart shows. It always holds the scores and the sign-off line, with some air, so a move from
 * 63 to 81 is visible instead of a flat line on a 0 to 100 scale.
 */
export function sparkDomain(scores: number[]): Domain {
  const lo = Math.max(0, Math.min(...scores, SIGN_OFF_SCORE) - 8);
  const hi = Math.min(100, Math.max(...scores, SIGN_OFF_SCORE) + 8);
  return { lo, hi };
}

export function sparkY(score: number, height: number, d: Domain, pad = 3): number {
  const t = (Math.min(d.hi, Math.max(d.lo, score)) - d.lo) / (d.hi - d.lo);
  return pad + (1 - t) * (height - pad * 2);
}

/** Points for an SVG polyline, oldest on the left. */
export function sparkPoints(scores: number[], width: number, height: number, d: Domain, pad = 3): { x: number; y: number }[] {
  if (scores.length === 1) return [{ x: width - pad, y: sparkY(scores[0], height, d, pad) }];
  const step = (width - pad * 2) / (scores.length - 1);
  return scores.map((s, i) => ({ x: pad + i * step, y: sparkY(s, height, d, pad) }));
}

/** Newest activity first is how the API sends them; a website is never listed as having a pass. */
export function hasPass(r: RepoSummary): boolean {
  return Boolean(r.pass_expires_at) && r.kind !== "site";
}

/** What the quota meter shows: boxes to draw (capped so a big limit stays readable) and how many are used. */
export function meterBoxes(q: Me["quota"], cap = 10): { total: number; used: number } {
  const total = Math.min(Math.max(q.limit, 0), cap);
  const used = Math.min(Math.max(q.used, 0), total);
  return { total, used };
}
