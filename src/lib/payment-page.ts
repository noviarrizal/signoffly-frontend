/**
 * The address of a card payment page, as the API hands it out, is the one place where we send a person somewhere
 * else with their money in mind. It is only followed when it is really a page of Lemon Squeezy: https, no
 * credentials, and a host that is lemonsqueezy.com or one of its subdomains.
 */
export function isPaymentPage(value: string | undefined | null): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase();
    return u.protocol === "https:" && !u.username && !u.password && (host === "lemonsqueezy.com" || host.endsWith(".lemonsqueezy.com"));
  } catch {
    return false;
  }
}