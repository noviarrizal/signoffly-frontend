interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

/**
 * The primary email of a GitHub account, only if GitHub has verified it.
 * The profile email can be empty or unverified, so the account's own email list is read.
 * The API links accounts by email only when it is verified, so anything else returns null.
 */
export async function primaryVerifiedEmail(accessToken: string | null | undefined, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  if (!accessToken) return null;
  try {
    const res = await fetchImpl("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json", "User-Agent": "signoffly" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const list = (await res.json()) as GitHubEmail[];
    if (!Array.isArray(list)) return null;
    return list.find((e) => e.primary && e.verified && typeof e.email === "string")?.email ?? null;
  } catch {
    return null;
  }
}