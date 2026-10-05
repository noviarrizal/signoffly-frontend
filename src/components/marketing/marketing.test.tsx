import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checks } from "@/components/marketing/checks";
import { SampleReport } from "@/components/marketing/sample-report";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Faq } from "@/components/marketing/faq";
import { Footer } from "@/components/footer";
import { SAMPLE_REPORT } from "@/lib/sample-report";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("Checks", () => {
  it("shows the four areas, each with its own card and no placeholder tags", () => {
    render(<Checks />);
    expect(screen.getAllByRole("article")).toHaveLength(4);
    for (const name of ["Legal and privacy", "Security", "Testing", "Code quality"]) expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });
  it("keeps the legal disclaimer next to the regions", () => {
    render(<Checks />);
    expect(screen.getByText("Findings to review with a professional. Not legal advice.")).toBeInTheDocument();
    for (const r of ["UU PDP", "GDPR", "CCPA", "PDPA"]) expect(screen.getByText(r)).toBeInTheDocument();
  });
});

describe("SampleReport", () => {
  it("is labelled as sample data", () => {
    render(<SampleReport />);
    expect(screen.getByText("Sample data")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "lumen-notes/web" })).toBeInTheDocument();
  });

  it("only contains findings the product can really produce today", () => {
    const categories = new Set(SAMPLE_REPORT.findings.map((f) => f.category));
    expect([...categories].sort()).toEqual(["legal", "quality", "security", "testing"]);
    expect(SAMPLE_REPORT.findings.every((f) => f.fix_prompt && f.explanation)).toBe(true);
    expect(SAMPLE_REPORT.tally).toEqual({
      high: SAMPLE_REPORT.findings.filter((f) => f.severity === "high").length,
      medium: SAMPLE_REPORT.findings.filter((f) => f.severity === "medium").length,
      low: SAMPLE_REPORT.findings.filter((f) => f.severity === "low").length,
    });
  });

  it("keeps every legal finding hedged and carrying the disclaimer", () => {
    for (const f of SAMPLE_REPORT.findings.filter((x) => x.category === "legal")) {
      expect(f.disclaimer).toBe("A finding to review, not legal advice.");
      expect(f.regions.length).toBeGreaterThan(0);
    }
  });
});

describe("PricingPlans", () => {
  const action = <button>Get a pass</button>;
  it("shows only the prices the API says can be paid today", () => {
    render(<PricingPlans action={action} catalog={{ pass_days: 14, options: [{ currency: "IDR", amount_minor: 149000, display: "Rp149.000", methods: ["manual"] }] }} />);
    expect(screen.getByText("Rp149.000")).toBeInTheDocument();
    expect(screen.getByText("per project, 14 days")).toBeInTheDocument();
    expect(screen.queryByText(/\$19/)).not.toBeInTheDocument();
    expect(screen.getByText("3 scans a day")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get a pass" })).toBeInTheDocument();
  });

  it("falls back to words, not a made-up price, when the API is unreachable", () => {
    render(<PricingPlans action={action} catalog={{ pass_days: 14, options: [] }} />);
    expect(screen.getByText("One repository for 14 days")).toBeInTheDocument();
    expect(screen.queryByText(/Rp\d|\$[1-9]/)).not.toBeInTheDocument(); // the free plan's $0 is real, a pass price is not
  });
});

describe("Faq and Footer", () => {
  it("opens the first answer and lists four questions", () => {
    render(<Faq />);
    expect(screen.getAllByText(/\?$/)).toHaveLength(4);
    expect(screen.getByText(/Legal findings are automated flags/).closest("details")).toHaveAttribute("open");
    expect(screen.getByText("Does Signoffly run my code?").closest("details")).not.toHaveAttribute("open");
  });
  it("links to the sections that exist", () => {
    render(<Footer />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(expect.arrayContaining(["/#how", "/#checks", "/#report", "/pricing", "/#faq"]));
    expect(hrefs).not.toContain("#"); // no dead links
  });
});