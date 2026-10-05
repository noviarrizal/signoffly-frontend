import "server-only";
import { goApiUrl } from "@/lib/env";
import type { Catalog } from "@/lib/api/types";

const FALLBACK: Catalog = { pass_days: 14, options: [] };

/** What can be bought today, from the API. If it is unreachable the page still renders, with no prices. */
export async function loadCatalog(): Promise<Catalog> {
  try {
    const res = await fetch(`${goApiUrl()}/v1/pricing`, { cache: "no-store", signal: AbortSignal.timeout(5_000) });
    if (res.ok) return (await res.json()) as Catalog;
  } catch {
    // Fall through to the fallback.
  }
  return FALLBACK;
}