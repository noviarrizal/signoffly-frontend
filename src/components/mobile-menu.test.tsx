import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileMenu } from "@/components/mobile-menu";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];
const signOut = <button>Sign out now</button>;

beforeEach(() => {
  pathname = "/";
});

describe("MobileMenu", () => {
  it("is closed at first and the button says so", () => {
    render(<MobileMenu links={links} signedIn={false} signOut={signOut} />);
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Menu" })).not.toBeInTheDocument();
  });

  it("opens, lists the links and offers sign in when signed out", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={links} signedIn={false} signOut={signOut} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    const nav = screen.getByRole("navigation", { name: "Menu" });
    expect(nav).toHaveTextContent("How it works");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/signin");
    expect(screen.queryByText("Sign out now")).not.toBeInTheDocument();
  });

  it("offers sign out instead of sign in when signed in", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={links} signedIn signOut={signOut} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByText("Sign out now")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("closes with Escape, with the button and when a link is chosen", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={links} signedIn={false} signOut={signOut} />);
    const open = () => user.click(screen.getByRole("button", { name: "Open menu" }));

    await open();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("navigation", { name: "Menu" })).not.toBeInTheDocument();

    await open();
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("navigation", { name: "Menu" })).not.toBeInTheDocument();

    await open();
    await user.click(screen.getByRole("link", { name: "Pricing" }));
    expect(screen.queryByRole("navigation", { name: "Menu" })).not.toBeInTheDocument();
  });

  it("is closed again when the page changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MobileMenu links={links} signedIn={false} signOut={signOut} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation", { name: "Menu" })).toBeInTheDocument();
    pathname = "/pricing";
    rerender(<MobileMenu links={links} signedIn={false} signOut={signOut} />);
    expect(screen.queryByRole("navigation", { name: "Menu" })).not.toBeInTheDocument();
  });
});