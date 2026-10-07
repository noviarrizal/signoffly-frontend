import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkout } from "@/components/pricing/checkout";
import type { Catalog, Order } from "@/lib/api/types";

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const PAGE = "https://signoffly.lemonsqueezy.com/checkout/custom/abc-123?signature=deadbeef";

const card: Catalog = { pass_days: 14, options: [{ currency: "USD", amount_minor: 1900, display: "$19.00", methods: ["lemonsqueezy"] }] };
const both: Catalog = {
  pass_days: 14,
  options: [
    { currency: "USD", amount_minor: 1900, display: "$19.00", methods: ["lemonsqueezy"] },
    { currency: "IDR", amount_minor: 149000, display: "Rp149.000", methods: ["manual"] },
  ],
};

const cardOrder = (url: string | undefined): Order => ({
  id: "o1",
  repo: "acme/shop",
  status: "pending",
  created_at: "2026-10-08T10:00:00Z",
  payment: { method: "lemonsqueezy", reference: "SO-ABC234", currency: "USD", amount_minor: 1900, display: "$19.00", checkout_url: url },
});

async function submit(catalog: Catalog, navigate = vi.fn()) {
  const user = userEvent.setup();
  render(<Checkout catalog={catalog} signedIn initialRepo="github.com/acme/shop" navigate={navigate} />);
  await user.click(screen.getByRole("button", { name: "Get a project pass" }));
  return navigate;
}

describe("Checkout with a card", () => {
  it("asks for a card order and takes the buyer to the payment page, with a button as a fallback", async () => {
    fetchMock.mockResolvedValueOnce(json(201, cardOrder(PAGE)));
    const navigate = await submit(card);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(PAGE));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ repo_url: "github.com/acme/shop", currency: "USD", method: "lemonsqueezy" });
    expect(screen.getByRole("link", { name: "Pay by card or PayPal" })).toHaveAttribute("href", PAGE);
    expect(screen.getByText(/Your pass starts by itself a minute after the payment/)).toBeInTheDocument();
    expect(screen.queryByText("Reference")).not.toBeInTheDocument(); // there is nothing to write in a transfer note
  });

  it.each(["https://evil.example/checkout", "http://signoffly.lemonsqueezy.com/checkout", "javascript:alert(1)", undefined])(
    "never follows %s, and does not show a card order that cannot be paid",
    async (bad) => {
      fetchMock.mockResolvedValueOnce(json(201, cardOrder(bad)));
      const navigate = await submit(card);
      expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong on our side");
      expect(navigate).not.toHaveBeenCalled();
      expect(screen.queryByRole("link", { name: "Pay by card or PayPal" })).not.toBeInTheDocument();
    },
  );

  it("says in the API's own words when the card payment could not be started", async () => {
    fetchMock.mockResolvedValueOnce(
      json(502, { error: { code: "payment_unavailable", message: "We could not start the card payment. Nothing was charged. Try again in a moment." } }),
    );
    const navigate = await submit(card);
    expect(await screen.findByRole("alert")).toHaveTextContent("Nothing was charged");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("keeps the transfer instructions for rupiah", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      json(201, { ...cardOrder(undefined), payment: { method: "manual", reference: "SO-XYZ789", currency: "IDR", amount_minor: 149123, display: "Rp149.123", instructions: "Transfer to ACCOUNT" } }),
    );
    const navigate = vi.fn();
    render(<Checkout catalog={both} signedIn initialRepo="github.com/acme/shop" navigate={navigate} />);
    await user.click(screen.getByRole("button", { name: /IDR/ }));
    await user.click(screen.getByRole("button", { name: "Get a project pass" }));
    expect(await screen.findByText("SO-XYZ789")).toBeInTheDocument();
    expect(screen.getByText("Transfer to ACCOUNT")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("refuses a link that is not a repository, as before", async () => {
    const user = userEvent.setup();
    render(<Checkout catalog={card} signedIn initialRepo="yourapp.com" navigate={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Get a project pass" }));
    expect(screen.getByRole("alert")).toHaveTextContent("A pass covers repositories, not websites");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});