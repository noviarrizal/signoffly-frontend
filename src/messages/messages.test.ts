import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import { t } from "@/lib/messages";

describe("message catalog", () => {
  it("has no em or en dashes (design guide, section 9)", () => {
    for (const [key, value] of Object.entries(en)) expect(value, key).not.toMatch(/[\u2013\u2014]/);
  });
  it("never claims compliance (legal wording rule)", () => {
    for (const [key, value] of Object.entries(en)) expect(value, key).not.toMatch(/\b(compliant|guaranteed|certified)\b/i);
  });
  it("uses the one label for the scan action", () => {
    expect(t("scan")).toBe("Scan a repo");
  });
  it("fills placeholders", () => {
    expect(t("account.quota.value", { used: 2, limit: 3 })).toBe("2 of 3 used");
    expect(t("pricing.pass.per", { days: 14 })).toBe("per project, 14 days");
  });
});