import { describe, expect, it } from "vitest";
import { hasPass, meterBoxes, scoreDelta, sparkDomain, sparkPoints, sparkY } from "@/lib/workspace";

describe("scoreDelta", () => {
  it("compares the latest score with the first", () => {
    expect(scoreDelta([])).toEqual({ kind: "first" });
    expect(scoreDelta([55])).toEqual({ kind: "first" });
    expect(scoreDelta([40, 63, 81])).toEqual({ kind: "up", by: 41 });
    expect(scoreDelta([90, 70])).toEqual({ kind: "down", by: 20 });
    expect(scoreDelta([70, 50, 70])).toEqual({ kind: "same" });
  });
});

describe("sparkDomain", () => {
  it("always holds the scores and the 80 line, with some air, inside 0 to 100", () => {
    expect(sparkDomain([40, 63, 81])).toEqual({ lo: 32, hi: 89 });
    expect(sparkDomain([96])).toEqual({ lo: 72, hi: 100 });
    expect(sparkDomain([5])).toEqual({ lo: 0, hi: 88 });
  });
});

describe("sparkPoints", () => {
  it("spreads scores across the width, higher scores higher up", () => {
    const d = { lo: 0, hi: 100 };
    expect(sparkPoints([0, 100], 100, 30, d, 0)).toEqual([
      { x: 0, y: 30 },
      { x: 100, y: 0 },
    ]);
    expect(sparkY(50, 30, d, 0)).toBe(15);
  });
  it("puts a single score at the right end, and clamps nonsense", () => {
    const d = { lo: 0, hi: 100 };
    const [only] = sparkPoints([150], 100, 30, d, 3);
    expect(only.x).toBe(97);
    expect(only.y).toBe(3);
    expect(sparkPoints([-20], 100, 30, d, 3)[0].y).toBe(27);
  });
});

describe("hasPass", () => {
  it("is false for a website even if the API sent a date", () => {
    const base = { repo: "a/b", scans: 1, scores: [], latest: { id: "x", repo: "a/b", status: "done" as const, created_at: "" } };
    expect(hasPass({ ...base, kind: "repo", pass_expires_at: "2026-10-22T00:00:00Z" })).toBe(true);
    expect(hasPass({ ...base, kind: "site", pass_expires_at: "2026-10-22T00:00:00Z" })).toBe(false);
    expect(hasPass({ ...base, kind: "repo" })).toBe(false);
  });
});

describe("meterBoxes", () => {
  it("never draws more boxes than fit, nor more used than total", () => {
    expect(meterBoxes({ limit: 3, used: 2, remaining: 1 })).toEqual({ total: 3, used: 2 });
    expect(meterBoxes({ limit: 50, used: 60, remaining: 0 })).toEqual({ total: 10, used: 10 });
    expect(meterBoxes({ limit: 0, used: 1, remaining: 0 })).toEqual({ total: 0, used: 0 });
  });
});
