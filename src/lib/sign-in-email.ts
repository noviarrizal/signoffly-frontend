import { primaryVerifiedEmail } from "@/lib/github-email";

/** The part of the provider's profile that matters here. Google sends these fields in its ID token. */
export interface ProfileClaims {
  email?: unknown;
  email_verified?: unknown;
}

/**
 * The email of a Google sign-in, only if Google says it has verified it. The API links accounts by verified email only,
 * so an address Google has not verified is treated as no address at all. Anything but the boolean `true` counts as not
 * verified, because a string such as "false" is truthy.
 */
export function googleVerifiedEmail(profile: ProfileClaims | null | undefined): string | null {
  if (!profile || profile.email_verified !== true) return null;
  const email = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : "";
  return email.includes("@") ? email : null;
}

/**
 * The verified email for a sign-in, or null when the provider gives none we can trust. `null` makes the sign-in fail with
 * the "no verified email" message. `fetchImpl` is only replaced in tests.
 */
export async function verifiedEmailFor(
  provider: string,
  account: { access_token?: string | null } | null | undefined,
  profile: ProfileClaims | null | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  if (provider === "github") return primaryVerifiedEmail(account?.access_token, fetchImpl);
  if (provider === "google") return googleVerifiedEmail(profile);
  return null;
}

/** The providers that sign people in through their own account, as opposed to the development sign-in. */
export const OAUTH_PROVIDERS = ["github", "google"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
export const isOAuthProvider = (id: string | undefined): id is OAuthProvider => OAUTH_PROVIDERS.includes(id as OAuthProvider);