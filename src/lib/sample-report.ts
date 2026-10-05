import type { Finding, Report } from "@/lib/api/types";

/**
 * A made-up report for the landing page. The repository does not exist and the numbers are examples.
 * It only shows findings Signoffly can really produce today (secrets, dependencies, Supabase, privacy, tests, code quality),
 * so it never implies a check that has not been built. The page labels it "Sample data".
 */
const f = (over: Partial<Finding> & Pick<Finding, "title" | "explanation" | "fix_prompt" | "severity" | "category" | "fingerprint">): Finding => ({
  rule_id: "sample.finding",
  blocking: false,
  confidence: "high",
  evidence: [],
  regions: [],
  ...over,
});

export const SAMPLE_REPORT: Report = {
  scan_id: "00000000-0000-4000-8000-000000000000",
  repo: { owner: "lumen-notes", name: "web", scanned_at: "2026-10-04T10:00:00Z" },
  verdict: "needs_work",
  score: 63,
  summary: "Fix three things before you launch.",
  complete: true,
  tally: { high: 3, medium: 3, low: 2 },
  regions: ["uu-pdp", "gdpr"],
  categories: [
    { id: "security", count: 3 },
    { id: "testing", count: 1 },
    { id: "quality", count: 1 },
    { id: "legal", count: 3 },
  ],
  findings: [
    f({
      fingerprint: "s1",
      category: "security",
      severity: "high",
      blocking: true,
      title: "A Stripe secret key is committed to the repo",
      explanation: "Anyone who can see this repo can charge and refund on your account. Rotate the key now, then remove it from git history.",
      evidence: [{ path: ".env.example", line_start: 4 }],
      fix_prompt:
        "Remove the Stripe secret key from .env.example and replace it with a placeholder. Read it from process.env.STRIPE_SECRET_KEY instead, add .env to .gitignore, and list the exact steps to rotate the key in the Stripe dashboard and clean it out of git history.",
    }),
    f({
      fingerprint: "l1",
      category: "legal",
      severity: "high",
      confidence: "medium",
      title: "You collect emails and phone numbers but have no privacy policy",
      explanation: "The signup form stores personal data. Privacy laws in several regions expect a clear notice before you collect it.",
      evidence: [{ path: "app/signup/page.tsx" }],
      regions: ["uu-pdp", "gdpr"],
      disclaimer: "A finding to review, not legal advice.",
      fix_prompt:
        "Add a /privacy page that explains what personal data this app collects (email, phone number), why, how long it is kept, and how a user can ask for deletion. Link it from the signup form and add an unchecked consent checkbox before submit. Keep the wording plain and mark anything that needs a lawyer to review.",
    }),
    f({
      fingerprint: "s2",
      category: "security",
      severity: "high",
      blocking: true,
      title: "Anyone can read the profiles table",
      explanation: "The profiles table has no row level security, so anyone holding your public key can read every user's email.",
      evidence: [{ path: "supabase/migrations/002_profiles.sql", line_start: 1 }],
      fix_prompt:
        "Enable row level security on the profiles table and add policies so a signed-in user can only select and update their own row (auth.uid() = id). Show me the migration SQL and a test that proves another user cannot read it.",
    }),
    f({
      fingerprint: "s3",
      category: "security",
      severity: "medium",
      title: "A package you use has a known security problem",
      explanation: "One of your dependencies has a published vulnerability. A newer version fixes it.",
      evidence: [{ path: "package-lock.json" }],
      fix_prompt: "List the dependencies with known vulnerabilities in this project, upgrade each to the lowest version that fixes it, run the tests, and tell me about any breaking change.",
    }),
    f({
      fingerprint: "l2",
      category: "legal",
      severity: "medium",
      confidence: "medium",
      title: "Tracking tools load and there is no consent banner",
      explanation: "Google Analytics can follow visitors from page to page. Some laws expect people to agree first, for example visitors from Europe.",
      evidence: [{ path: "app/layout.tsx", line_start: 14 }],
      regions: ["gdpr"],
      disclaimer: "A finding to review, not legal advice.",
      fix_prompt: "Add a consent banner so Google Analytics only loads after a visitor agrees, with accept and reject buttons of equal weight and a way to change the choice later. Mark anything that needs a lawyer to review.",
    }),
    f({
      fingerprint: "t1",
      rule_id: "testing.risky_untested",
      category: "testing",
      severity: "medium",
      confidence: "medium",
      title: "We found no test that mentions your payments code",
      explanation:
        "Your app handles payments, and none of its tests mention payments, checkout or webhooks. A silent bug here costs you customers or money. This is judged from file names and what the tests mention, not from measured coverage.",
      evidence: [{ path: "app/api/checkout/route.ts" }],
      fix_prompt:
        "Write tests for the payment code: a successful payment, a declined card, a duplicate submit, a webhook that arrives twice, and a request from a signed-out visitor. Use the test runner already in this project and mock the payment provider.",
    }),
    f({
      fingerprint: "q1",
      rule_id: "quality.duplicate_code",
      category: "quality",
      severity: "low",
      title: "The same code is copied in several places",
      explanation: "About 86 lines across 3 files look copied from each other. A fix in one place does not reach the others, and the copies slowly drift apart.",
      evidence: [{ path: "lib/orders.ts", line_start: 6, line_end: 18 }],
      fix_prompt: "Move the shared logic in lib/orders.ts, lib/invoices.ts and app/cart/page.tsx into one function, make each place use it, and delete the copies. Do not change behavior.",
    }),    f({
      fingerprint: "l3",
      category: "legal",
      severity: "low",
      confidence: "low",
      title: "We could not find a way for users to delete their account",
      explanation: "This can be fine if you handle requests by email. If so, say so in your privacy policy and make sure someone answers.",
      regions: ["uu-pdp", "gdpr"],
      disclaimer: "A finding to review, not legal advice.",
      fix_prompt: "Add a way for signed-in users to delete their account and download their data, or describe in the privacy policy how to ask for it by email. Make deletion remove the user's rows in every table.",
    }),
  ],
  coverage: { analyzers_run: ["secrets", "deps", "supabase", "legal"], analyzers_skipped: [], analyzers_failed: [], analyzers_incomplete: [], notes: {} },
  disclaimer: "Automated findings. Review anything legal with a professional.",
  access: { tier: "paid", locked_findings: 0 },
};