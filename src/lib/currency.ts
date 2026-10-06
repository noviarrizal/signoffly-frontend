import type { Catalog } from "@/lib/api/types";

/** The header Cloudflare adds with the visitor's country (ISO 3166-1 alpha-2, or XX and T1 when unknown or Tor). */
export const COUNTRY_HEADER = "cf-ipcountry";

/**
 * The currency to show first. This only picks a default: the country comes from the IP address,
 * which a VPN changes, so it never limits what can be bought. The payment method does that
 * (IDR is only payable with Indonesian bank transfer or QRIS).
 */
export function preferredCurrency(country: string | null | undefined): string {
  return country?.trim().toUpperCase() === "ID" ? "IDR" : "USD";
}

/** The same catalog with the visitor's preferred currency first, so the checkout selects it by default. */
export function orderForCountry(catalog: Catalog, country: string | null | undefined): Catalog {
  const first = preferredCurrency(country);
  const options = [...catalog.options].sort((a, b) => Number(b.currency === first) - Number(a.currency === first));
  return { ...catalog, options };
}
