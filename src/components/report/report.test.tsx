import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stamp } from "@/components/report/stamp";
import { ScoreRing } from "@/components/report/score-ring";
import { SeverityTag } from "@/components/ui/tag";
import { FixPrompt } from "@/components/report/fix-prompt";
import { FindingRow } from "@/components/report/finding-row";
import { ReportView } from "@/components/report/report-view";
import { finding, report } from "@/test/fixtures";

describe("Stamp", () => {
  it("differs by frame style and text, never by color alone", () => {
    const { rerender } = render(<Stamp verdict="signed_off" />);
    expect(screen.getByRole("img", { name: /signed off/i }).className).toMatch(/border-solid.*border-accent/);
    rerender(<Stamp verdict="needs_work" />);
    expect(screen.getByRole("img", { name: /needs work/i }).className).toContain("border-dashed");
    rerender(<Stamp verdict="blocked" />);
    const blocked = screen.getByRole("img", { name: /blocked/i });
    expect(blocked.className).toContain("bg-ink");
    expect(blocked).toHaveTextContent("Blocked");
  });
});

describe("ScoreRing and SeverityTag", () => {
  it("states the score in words and clamps it", () => {
    const { rerender } = render(<ScoreRing score={63} verdict="needs_work" />);
    expect(screen.getByRole("img", { name: "Score 63 out of 100" })).toBeInTheDocument();
    rerender(<ScoreRing score={140} verdict="needs_work" />);
    expect(screen.getByRole("img", { name: "Score 100 out of 100" })).toBeInTheDocument();
  });
  it("labels severity with text and a different fill each", () => {
    render(
      <>
        <SeverityTag severity="high" />
        <SeverityTag severity="medium" />
        <SeverityTag severity="low" count={3} />
      </>,
    );
    expect(screen.getByText("High").className).toContain("bg-ink");
    expect(screen.getByText("Medium").className).toContain("border-ink");
    expect(screen.getByText("3 low").className).toContain("bg-low-tint");
  });
});

describe("FixPrompt", () => {
  it("copies the prompt and says so for a moment", async () => {
    const user = userEvent.setup(); // installs its own clipboard, so spy after this
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<FixPrompt text="Do the fix" />);
    await user.click(screen.getByRole("button", { name: "Copy fix prompt" }));
    expect(writeText).toHaveBeenCalledWith("Do the fix");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
});

describe("FindingRow", () => {
  it("shows the explanation, the location, the fix prompt and that it blocks sign-off", () => {
    render(<ol><FindingRow finding={finding()} repo="acme/shop" /></ol>);
    expect(screen.getByRole("heading", { name: "A Stripe key is in your code" })).toBeInTheDocument();
    expect(screen.getByText(/charge and refund/)).toBeInTheDocument();
    expect(screen.getByText("src/lib/stripe.ts:12")).toBeInTheDocument();
    expect(screen.getByText("Blocks sign-off")).toBeInTheDocument();
    expect(screen.getByText(/rotate it/)).toBeInTheDocument();
  });

  it("shows only the title and location for a locked finding, and a way to unlock", () => {
    render(<ol><FindingRow finding={finding({ locked: true, explanation: "", fix_prompt: "", evidence: [{ path: "src/a.ts", line_start: 3 }] })} repo="acme/shop" /></ol>);
    expect(screen.getByText("src/a.ts:3")).toBeInTheDocument();
    expect(screen.queryByText("Copy fix prompt")).not.toBeInTheDocument();
    expect(screen.getByText("Details are part of a project pass")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Unlock this report" })).toHaveAttribute("href", "/pricing?repo=acme%2Fshop");
  });

  it("names the regions and the disclaimer on legal findings", () => {
    render(<ol><FindingRow finding={finding({ category: "legal", regions: ["uu-pdp", "gdpr"], disclaimer: "A finding to review, not legal advice.", evidence: [] })} repo="acme/shop" /></ol>);
    expect(screen.getByText(/Applies under: UU PDP \(Indonesia\) and GDPR \(EU\)\./)).toBeInTheDocument();
    expect(screen.getByText(/A finding to review, not legal advice\./)).toBeInTheDocument();
  });
});

describe("ReportView", () => {
  it("shows the repo, verdict, score, tally and counts per tab", () => {
    render(<ReportView report={report()} />);
    expect(screen.getByRole("heading", { name: "acme/shop" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /needs work/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fix 3 things before you launch." })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /All\s*3/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Legal\s*1/ })).toBeInTheDocument();
    const regions = screen.getByRole("group", { name: "Legal regions" });
    expect(regions).toHaveTextContent("Legal checks for");
    expect(within(regions).getByText("Indonesia")).toBeInTheDocument();
    expect(within(regions).getByText("EU")).toBeInTheDocument();
  });

  it("filters by tab with a click and with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<ReportView report={report()} />);
    await user.click(screen.getByRole("tab", { name: /Legal/ }));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("No privacy policy")).toBeInTheDocument();
    expect(within(panel).queryByText("A Stripe key is in your code")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /All/ }));
    screen.getByRole("tab", { name: /All/ }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Security/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: /Legal/ })).toHaveAttribute("aria-selected", "true"); // wraps around
  });

  it("says so when a tab is empty, and what was checked", async () => {
    const user = userEvent.setup();
    render(<ReportView report={report()} />);
    await user.click(screen.getByRole("tab", { name: /Testing/ }));
    expect(screen.getByText("Nothing here. Good sign.")).toBeInTheDocument();
    expect(screen.getByText(/secrets, deps/)).toBeInTheDocument();
  });

  it("warns that a report with a gap cannot be signed off", () => {
    render(<ReportView report={report({ complete: false, coverage: { ...report().coverage, analyzers_incomplete: ["supabase"], analyzers_failed: [{ id: "deps", reason: "took too long" }] } })} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Some checks could not finish");
    expect(alert).toHaveTextContent("supabase");
    expect(alert).toHaveTextContent("deps: took too long");
  });

  it("tells a free reader how many findings are locked and links to pricing", () => {
    const fs = [finding({ fingerprint: "1" }), finding({ fingerprint: "2", locked: true, explanation: "", fix_prompt: "" }), finding({ fingerprint: "3", locked: true, explanation: "", fix_prompt: "" })];
    render(<ReportView report={report({ findings: fs, access: { tier: "free", locked_findings: 2 } })} />);
    expect(screen.getByText("2 findings show only a title and a location. A project pass unlocks them all.")).toBeInTheDocument();
    expect(screen.getAllByText("Details are part of a project pass")).toHaveLength(2);
  });

  it("shows no locked banner for a paid reader", () => {
    render(<ReportView report={report()} />);
    expect(screen.queryByText(/project pass unlocks/)).not.toBeInTheDocument();
  });
});

describe("ReportView for a website check", () => {
  const site = () =>
    report({
      kind: "site",
      repo: { owner: "", name: "yourapp.com", scanned_at: "2026-10-07T10:00:00Z" },
      complete: false,
      summary: "Here is what a visitor can see from the outside. Connect the repository to check the code itself before you launch.",
      findings: [finding({ fingerprint: "w1", rule_id: "web.security_headers", severity: "medium", blocking: false, title: "Your site does not send some protective headers", evidence: [{ path: "/", snippet: "response header missing: Content-Security-Policy" }] })],
      tally: { high: 0, medium: 1, low: 0 },
      coverage: {
        analyzers_run: ["web"],
        analyzers_skipped: [],
        analyzers_failed: [],
        analyzers_incomplete: ["web"],
        notes: { web: ["Only what a visitor's browser receives was checked.", "This address sends visitors to app.vercel.app. The checks below were run on that address."] },
      },
    });

  it("shows the host, not owner and name", () => {
    render(<ReportView report={site()} />);
    expect(screen.getByRole("heading", { name: "yourapp.com" })).toBeInTheDocument();
    expect(screen.queryByText("/yourapp.com")).not.toBeInTheDocument();
  });

  it("only offers the tabs a website can have", () => {
    render(<ReportView report={site()} />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent?.replace(/\d+$/, "").trim())).toEqual(["All", "Security", "Legal"]);
  });

  it("says what a check from the outside is, lists what it could not see, and points to the repository", () => {
    render(<ReportView report={site()} />);
    expect(screen.getByText("This is a check from the outside")).toBeInTheDocument();
    expect(screen.getByText(/cannot be signed off/)).toBeInTheDocument();
    expect(screen.getByText("What this check could not see")).toBeInTheDocument();
    expect(screen.getByText(/sends visitors to app\.vercel\.app/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scan the repository" })).toHaveAttribute("href", "/");
    expect(screen.queryByText("Some checks could not finish")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("labels the stamp as a view from the outside", () => {
    render(<ReportView report={site()} />);
    expect(screen.getByRole("img", { name: /needs work/i })).toHaveTextContent("from the outside");
  });

  it("leaves a repository report as it was", () => {
    render(<ReportView report={report()} />);
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    expect(screen.queryByText("This is a check from the outside")).not.toBeInTheDocument();
  });
});