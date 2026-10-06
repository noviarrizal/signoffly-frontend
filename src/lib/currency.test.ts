import { describe, expect, it } from "vitest";
import { orderForCountry, preferredCurrency } from "@/lib/currency";
import type { Catalog } from "@/lib/api/types";

const catalog: Catalog = {
  pass_days: 14,
  options: [
    { currency: "USD", amount_minor: 1900, display: "$19", methods: ["lemonsqueezy"] },
    { currency: "IDR", amount_minor: 149000, display: "Rp149.000", methods: ["manual"] },
  ],
};

describe("preferredCurrency", () => {
  it("is IDR only for Indonesia", () => {
    expect(preferredCurrency("ID")).toBe("IDR");
    expect(preferredCurrency(" id ")).toBe("IDR");
  });
  it("is USD for every other country, unknown visitors and Tor", () => {
    for (const c of ["US", "SG", "MY", "XX", "T1", "", null, undefined]) expect(preferredCurrency(c)).toBe("USD");
  });
});

describe("orderForCountry", () => {
  it("puts the visitor's currency first and keeps every option", () => {
    expect(orderForCountry(catalog, "ID").options.map((o) => o.currency)).toEqual(["IDR", "USD"]);
    expect(orderForCountry(catalog, "DE").options.map((o) => o.currency)).toEqual(["USD", "IDR"]);
  });
  it("leaves the catalog alone when the preferred currency is not on sale", () => {
    const idrOnly: Catalog = { ...catalog, options: [catalog.options[1]] };
    expect(orderForCountry(idrOnly, "US")).toEqual(idrOnly);
  });
  it("does not change the catalog it was given", () => {
    orderForCountry(catalog, "ID");
    expect(catalog.options[0].currency).toBe("USD");
  });
});
