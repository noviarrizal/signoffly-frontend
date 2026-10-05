import type { Finding, Report } from "@/lib/api/types";

export function finding(over: Partial<Finding> = {}): Finding {
  return {
    rule_id: "secrets.stripe_key",
    category: "security",
    severity: "high",
    blocking: true,
    confidence: "high",
    title: "A Stripe key is in your code",
    evidence: [{ path: "src/lib/stripe.ts", line_start: 12, snippet: "sk_live_****" }],
    regions: [],
    explanation: "Anyone who can see this repo can charge and refund on your account.",
    fix_prompt: "Move the key to an environment variable and rotate it.",
    fingerprint: Math.random().toString(36).slice(2),
    ...over,
  };
}

export function report(over: Partial<Report> = {}): Report {
  const findings = over.findings ?? [
    finding({ fingerprint: "a" }),
    finding({ fingerprint: "b", category: "legal", severity: "medium", blocking: false, title: "No privacy policy", regions: ["uu-pdp", "gdpr"], disclaimer: "A finding to review, not legal advice.", evidence: [] }),
    finding({ fingerprint: "c", category: "quality", severity: "low", blocking: false, title: "No lockfile" }),
  ];
  return {
    scan_id: "5f0a64c4-62d6-4b9b-8e0e-7b6f5c2f6d11",
    repo: { owner: "acme", name: "shop", branch: "main", commit: "abcdef1234567", scanned_at: "2026-10-05T10:00:00Z" },
    verdict: "needs_work",
    score: 63,
    summary: "Fix 3 things before you launch.",
    complete: true,
    tally: { high: 1, medium: 1, low: 1 },
    regions: ["uu-pdp", "gdpr"],
    categories: [],
    findings,
    coverage: { analyzers_run: ["secrets", "deps"], analyzers_skipped: [], analyzers_failed: [], analyzers_incomplete: [], notes: {} },
    disclaimer: "Automated findings. Review anything legal with a professional.",
    access: { tier: "paid", locked_findings: 0 },
    ...over,
  };
}