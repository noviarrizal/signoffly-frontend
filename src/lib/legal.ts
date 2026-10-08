import type { LegalFacts } from "@/content/legal-types";

/**
 * The facts the Privacy Policy and the Terms state. Each one is a decision that was made on 2026-10-05
 * (see docs/legal-review.md). Update the date when the text changes.
 *
 * `reviewedByLawyer` stays false until a qualified lawyer has read both documents. While it is false, each page
 * says so at the top. The text was drafted by an AI assistant from public guidance and is not legal advice.
 */
export const reviewedByLawyer = false;

export const BASE_FACTS: Omit<LegalFacts, "operatorName" | "contactEmail"> = {
  product: "Signoffly",
  lastUpdated: "5 October 2026",
  passDays: 14,
  refundDays: 7,
  freeScansPerDay: 3,
  governingLaw: "the Republic of Indonesia",
  processors: [
    { name: "GitHub", purpose: "Sign-in, and reading the public repositories you ask us to scan", where: "United States and other countries", active: true },
    // Not in use until Google sign-in is switched on (AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET). Set to true in that release.
    { name: "Google", purpose: "Sign-in, if you choose Google", where: "United States and other countries", active: false },
    { name: "Neon", purpose: "The database that stores accounts, scans and orders", where: "Singapore", active: true },
    // Not in use yet. Switch to true only when the provider really is used, and update the date above.
    { name: "Lemon Squeezy", purpose: "Card and PayPal payments", where: "United States", active: false },
    // Switch to true in the same release that sets LLM_ENABLED=true in the backend. Before that, read the provider's
    // own privacy policy and confirm where it processes data and whether API data is used for training, then fix
    // `where` below and ask the lawyer to review the changed text.
    { name: "DeepSeek", purpose: "Writing the plain-language explanation of each finding", where: "China", active: false, ai: true },
  ],
};

export interface Resolved {
  facts: LegalFacts;
  /** Names of the settings that are not filled in yet. */
  missing: string[];
}

/** Reads who operates the service from the environment, so no name or address is invented in code. */
export function resolveFacts(env: Record<string, string | undefined> = process.env): Resolved {
  const name = env.LEGAL_OPERATOR_NAME?.trim();
  const email = env.LEGAL_CONTACT_EMAIL?.trim();
  const missing: string[] = [];
  if (!name) missing.push("LEGAL_OPERATOR_NAME");
  if (!email) missing.push("LEGAL_CONTACT_EMAIL");
  return {
    facts: { ...BASE_FACTS, operatorName: name || "[operator name not set]", contactEmail: email || "[contact email not set]" },
    missing,
  };
}