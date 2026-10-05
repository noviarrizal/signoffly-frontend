import { describe, expect, it } from "vitest";
import { privacySections } from "@/content/privacy";
import { termsSections } from "@/content/terms";
import type { Block, LegalFacts, Section } from "@/content/legal-types";
import { BASE_FACTS, resolveFacts, reviewedByLawyer } from "@/lib/legal";

const facts: LegalFacts = { ...BASE_FACTS, operatorName: "Test Operator", contactEmail: "legal@example.test" };

function text(sections: Section[]): string {
  const flat = (b: Block): string[] => (typeof b === "string" ? [b] : "list" in b ? b.list : [...b.table.head, ...b.table.rows.flat()]);
  return sections.flatMap((s) => [s.title, ...s.blocks.flatMap(flat)]).join("\n");
}

const docs = { privacy: privacySections(facts), terms: termsSections(facts) };

describe.each(Object.entries(docs))("%s", (_name, sections) => {
  it("has unique section ids and titles, and every section has content", () => {
    expect(new Set(sections.map((s) => s.id)).size).toBe(sections.length);
    for (const s of sections) {
      expect(s.title.length).toBeGreaterThan(2);
      expect(s.blocks.length).toBeGreaterThan(0);
    }
  });

  it("has no em or en dashes (design guide, section 9)", () => {
    expect(text(sections)).not.toMatch(/[\u2013\u2014]/);
  });

  it("names the operator and the contact address, and leaves no unfilled template marks", () => {
    const all = text(sections);
    expect(all).toContain("Test Operator");
    expect(all).toContain("legal@example.test");
    expect(all).not.toMatch(/\{[a-zA-Z]+\}|\[operator|\[contact|TODO|lorem/i);
  });

  it("never claims compliance or certification, and promises no result", () => {
    expect(text(sections)).not.toMatch(/\b(fully compliant|gdpr compliant|certified|guarantees?d?)\b/i);
  });

  it("is readable: plain sentences, no section dominated by one huge paragraph", () => {
    for (const s of sections) for (const b of s.blocks) if (typeof b === "string") expect(b.length).toBeLessThan(900);
  });
});

describe("the privacy policy states what the product really does", () => {
  const all = text(docs.privacy);
  it("covers what the GDPR asks a notice to say", () => {
    for (const must of ["controller", "legitimate interest", "How long we keep it", "Your rights", "Where your data is processed", "Who we share data with"]) expect(all).toContain(must);
  });
  it("describes the data that is stored, and the data that is not", () => {
    expect(all).toMatch(/email address/);
    expect(all).toMatch(/GitHub account/);
    expect(all).toMatch(/delete the copy when the scan ends/);
    expect(all).toMatch(/never run your code/);
    expect(all).toMatch(/mask anything that looks like a secret/);
    expect(all).toMatch(/The link itself is not stored/);
    expect(all).toMatch(/do not use advertising or analytics trackers/);
  });
  it("says no code goes to an AI provider today, and promises to name one first", () => {
    expect(all).toMatch(/do not currently send your code or your data to an AI model provider/);
    expect(all).toMatch(/name the provider[\s\S]*before we start/);
  });
  it("lists only providers that are really in use", () => {
    expect(all).toContain("GitHub");
    expect(all).toContain("Neon");
    expect(all).not.toContain("Lemon Squeezy");
    const withPayments = privacySections({ ...facts, processors: facts.processors.map((p) => ({ ...p, active: true })) });
    expect(text(withPayments)).toContain("Lemon Squeezy");
  });
  it("matches the retention decision: kept until the account is deleted", () => {
    expect(all).toMatch(/until you delete your account/);
    expect(all).toMatch(/you can do both yourself on your account page/);
    expect(all).toMatch(/deleted with it/);
    expect(all).toMatch(/kept outside the app/); // payment records outside the app are the only thing that outlives the account
    expect(all).not.toMatch(/delete button.*is planned/);
  });
  it("does not promise a deadline it cannot be sure of", () => {
    expect(all).toMatch(/within the time the law requires/);
    expect(all).not.toMatch(/within \d+ (hours|days)/i);
  });
});

describe("the terms match the product's real numbers", () => {
  const all = text(docs.terms);
  it("states the free limit, the pass length and the refund window from one place", () => {
    expect(all).toContain(`${BASE_FACTS.freeScansPerDay} scans in any 24 hours`);
    expect(all).toContain(`${BASE_FACTS.passDays} days`);
    expect(all).toContain(`within ${BASE_FACTS.refundDays} days of paying`);
    expect(termsSections({ ...facts, passDays: 30, refundDays: 3 }).map((s) => s.blocks.join(" ")).join(" ")).toMatch(/30 days/);
  });
  it("says the results are automated and that legal findings are not legal advice", () => {
    expect(all).toMatch(/not legal advice/);
    expect(all).toMatch(/not that your app is secure, correct or lawful/);
    expect(all).toMatch(/not from running your code or measuring coverage/);
  });
  it("uses the governing law that was chosen", () => {
    expect(all).toContain("the Republic of Indonesia");
    expect(all).toMatch(/mandatory consumer law/);
  });
  it("limits liability only as far as the law allows", () => {
    expect(all).toMatch(/To the extent the law allows/);
    expect(all).toMatch(/cannot be limited by law/);
  });
  it("has the sections a SaaS agreement normally has", () => {
    const titles = docs.terms.map((s) => s.title.toLowerCase()).join("|");
    for (const must of ["what the service does", "your account", "refunds", "no warranty", "limit of our responsibility", "law that applies", "ending your use", "changes to these terms"]) expect(titles).toContain(must);
  });
});

describe("resolveFacts", () => {
  it("reads the operator from the environment and reports what is missing", () => {
    expect(resolveFacts({ LEGAL_OPERATOR_NAME: " A Name ", LEGAL_CONTACT_EMAIL: "a@b.co" })).toMatchObject({ missing: [], facts: { operatorName: "A Name", contactEmail: "a@b.co" } });
    const none = resolveFacts({});
    expect(none.missing).toEqual(["LEGAL_OPERATOR_NAME", "LEGAL_CONTACT_EMAIL"]);
    expect(none.facts.operatorName).toBe("[operator name not set]");
  });
  it("does not invent a name or an address", () => {
    expect(JSON.stringify(BASE_FACTS)).not.toMatch(/@/);
  });
  it("starts out as not reviewed by a lawyer", () => {
    expect(reviewedByLawyer).toBe(false);
  });
});