import "server-only";
import { headers } from "next/headers";
import { goApiUrl } from "@/lib/env";
import { COUNTRY_HEADER, orderForCountry } from "@/lib/currency";
import type { Catalog } from "@/lib/api/types";

const FALLBACK: Catalog = { pass_days: 14, options: [] };

/**
 * What can be bought today, from the API, with the visitor's currency first.
 * If the API is unreachable the page still renders, with no prices.
 */
export async function loadCatalog(): Promise<Catalog> {
  const country = (await headers()).get(COUNTRY_HEADER);
  try {
    const res = await fetch(`${goApiUrl()}/v1/pricing`, { cache: "no-store", signal: AbortSignal.timeout(5_000) });
    if (res.ok) return orderForCountry((await res.json()) as Catalog, country);
  } catch {
    // Fall through to the fallback.
  }
  return FALLBACK;
}
