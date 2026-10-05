// Shapes returned by the Go API (signoffly-backend: internal/report, internal/findings, internal/scan).

export type Severity = "high" | "medium" | "low";
export type Category = "security" | "testing" | "quality" | "legal";
export type Verdict = "signed_off" | "needs_work" | "blocked";
export type ScanStatus = "queued" | "running" | "done" | "failed";

export interface Evidence {
  path?: string;
  line_start?: number;
  line_end?: number;
  snippet?: string;
  detail?: Record<string, unknown>;
}

export interface Finding {
  rule_id: string;
  category: Category;
  severity: Severity;
  blocking: boolean;
  confidence: "high" | "medium" | "low";
  title: string;
  evidence: Evidence[];
  absence?: { searched: string[] };
  regions: string[];
  explanation: string;
  fix_prompt: string;
  disclaimer?: string;
  fingerprint: string;
  /** Set by the server on the free tier: explanation, fix prompt and snippet were removed. */
  locked?: boolean;
}

export interface Access {
  tier: "free" | "paid";
  locked_findings: number;
  pass_expires_at?: string;
}

export interface Tally {
  high: number;
  medium: number;
  low: number;
  blocking?: number;
}

export interface Report {
  scan_id: string;
  repo: { owner: string; name: string; branch?: string; commit?: string; scanned_at: string };
  verdict: Verdict;
  score: number;
  summary: string;
  complete: boolean;
  tally: Tally;
  regions: string[];
  categories: { id: Category; count: number }[];
  findings: Finding[];
  coverage: {
    analyzers_run: string[];
    analyzers_skipped: { id: string; reason: string }[];
    analyzers_failed: { id: string; reason: string }[];
    analyzers_incomplete: string[];
    notes: Record<string, string[]>;
  };
  disclaimer: string;
  access: Access;
}

export interface ScanStage {
  stage: string;
  status: "pending" | "running" | "done" | "failed" | "skipped";
}

export interface ScanView {
  id: string;
  repo: string;
  status: ScanStatus;
  current_stage?: string;
  error_code?: string;
  error_message?: string;
  verdict?: Verdict;
  score?: number;
  summary?: string;
  complete: boolean;
  stages: ScanStage[];
  tally: Tally;
  access?: Access;
}

export interface ScanSummary {
  id: string;
  repo: string;
  status: ScanStatus;
  verdict?: Verdict;
  score?: number;
  created_at: string;
  finished_at?: string;
}

export interface Me {
  user_id: string;
  quota: { limit: number; used: number; remaining: number; resets_at?: string };
  passes: { repo: string; expires_at: string }[];
}

export interface Payment {
  method: string;
  reference: string;
  currency: string;
  amount_minor: number;
  display: string;
  instructions?: string;
}

export interface Order {
  id: string;
  repo: string;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
  paid_at?: string;
  payment: Payment;
}

export interface Catalog {
  pass_days: number;
  options: { currency: string; amount_minor: number; display: string; methods: string[] }[];
}