import "server-only";
import { isIP } from "node:net";
import { headers } from "next/headers";

/** The name of the header the API reads the visitor's address from. The backend setting CLIENT_IP_HEADER must match it. */
export const FORWARD_HEADER = "X-Client-IP";

/**
 * The visitor's address, as the reverse proxy in front of this site saw it.
 *
 * Every call to the API comes from this server, so without this the API would see one address for everybody and
 * its per-address limits would apply to all visitors together. The header is only trusted because the proxy
 * overwrites it on every request (see deploy/Caddyfile): CLIENT_IP_HEADER names it ("x-real-ip" by default, or for
 * example "cf-connecting-ip" behind Cloudflare). Anything that is not a plain IP address is dropped, so a forged
 * value cannot carry text into the API.
 */
export function clientIpFrom(source: Pick<Headers, "get">): string | null {
  const name = (process.env.CLIENT_IP_HEADER || "x-real-ip").trim().toLowerCase();
  const first = source.get(name)?.split(",")[0]?.trim();
  return first && isIP(first) ? first : null;
}

/** The forwarding header for a call made while a request is being served (a page or a server action). */
export async function clientIpHeader(): Promise<Record<string, string>> {
  try {
    const ip = clientIpFrom(await headers());
    return ip ? { [FORWARD_HEADER]: ip } : {};
  } catch {
    return {}; // not inside a request, for example in a script
  }
}