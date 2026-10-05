import { describe, expect, it } from "vitest";
import { olderCursor, PAGE_SIZE, parseBefore } from "@/lib/history";
import type { ScanSummary } from "@/lib/api/types";

const scan = (i: number): ScanSummary => ({ id: String(i), repo: "a/b", status: "done", created_at: `2026-10-0${(i % 9) + 1}T10:00:00Z` });

describe("olderCursor", () => {
  it("points at the oldest scan of a full page", () => {
    const page = Array.from({ length: PAGE_SIZE }, (_, i) => scan(i));
    expect(olderCursor(page)).toBe(page[PAGE_SIZE - 1].created_at);
  });
  it("is null on a short page, an empty page and the last page", () => {
    expect(olderCursor([])).toBeNull();
    expect(olderCursor([scan(1)])).toBeNull();
    expect(olderCursor(Array.from({ length: PAGE_SIZE - 1 }, (_, i) => scan(i)))).toBeNull();
  });
});

describe("parseBefore", () => {
  it("keeps a real timestamp and drops everything else", () => {
    expect(parseBefore("2026-10-04T12:00:00Z")).toBe("2026-10-04T12:00:00Z");
    for (const bad of [undefined, "", "yesterday", ["2026-10-04T12:00:00Z"], "2026-10-04T12:00:00Z" + "x".repeat(60), "'; drop table"]) expect(parseBefore(bad as string)).toBeNull();
  });
});