import type { ScanSummary } from "@/lib/api/types";

export const PAGE_SIZE = 20;

/**
 * The cursor for the next (older) page, or null when this page was the last one.
 * The API returns scans newest first and `before` means "created before this time".
 */
export function olderCursor(scans: ScanSummary[], pageSize: number = PAGE_SIZE): string | null {
  if (scans.length < pageSize) return null;
  return scans[scans.length - 1]?.created_at ?? null;
}

/** A `before` value from the address bar, kept only if it is a real timestamp. */
export function parseBefore(value: string | string[] | undefined): string | null {
  if (typeof value !== "string" || value.length > 40) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : value;
}