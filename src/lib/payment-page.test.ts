import { describe, expect, it } from "vitest";
import { isPaymentPage } from "@/lib/payment-page";

describe("isPaymentPage", () => {
  it.each([
    "https://signoffly.lemonsqueezy.com/checkout/custom/abc-123?signature=deadbeef",
    "https://lemonsqueezy.com/checkout",
    "https://SIGNOFFLY.LemonSqueezy.com/checkout",
  ])("follows %s", (u) => expect(isPaymentPage(u)).toBe(true));

  it.each([
    undefined,
    null,
    "",
    "not a url",
    "http://signoffly.lemonsqueezy.com/checkout",
    "https://evil.example/checkout",
    "https://lemonsqueezy.com.evil.example/checkout",
    "https://evil-lemonsqueezy.com/checkout",
    "https://lemonsqueezy.com@evil.example/checkout",
    "https://user:pw@signoffly.lemonsqueezy.com/checkout",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "//signoffly.lemonsqueezy.com/checkout",
  ])("never follows %s", (u) => expect(isPaymentPage(u)).toBe(false));
});