import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScanForm } from "@/components/scan/scan-form";
import { ScanRunner } from "@/components/scan/scan-runner";
import { report } from "@/test/fixtures";

const push = vi.fn();
const router = { push }; // Next's router object is stable between renders, so the mock must be too
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const fetchMock = vi.fn();
beforeEach(() => {
  push.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const REPO = "https://github.com/acme/shop";

describe("ScanForm", () => {
  it("rejects a link that is not a GitHub repo, in words, without calling the server", async () => {
    const user = userEvent.setup();
    render(<ScanForm signedIn />);
    await user.type(screen.getByLabelText("GitHub repository or website"), "hello world");
    await user.click(screen.getByRole("button", { name: "Run a check" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Paste a GitHub link or a website address");
    expect(screen.getByLabelText("GitHub repository or website")).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a visitor who is not signed in to sign in, keeping the pasted link", async () => {
    const user = userEvent.setup();
    render(<ScanForm signedIn={false} />);
    await user.type(screen.getByLabelText("GitHub repository or website"), REPO);
    await user.click(screen.getByRole("button", { name: "Run a check" }));
    expect(push).toHaveBeenCalledWith(`/signin?repo=${encodeURIComponent(REPO)}`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("starts the scan with an idempotency key and opens it", async () => {
    fetchMock.mockResolvedValue(json(202, { id: "scan-1", status: "queued" }));
    const user = userEvent.setup();
    render(<ScanForm signedIn />);
    await user.type(screen.getByLabelText("GitHub repository or website"), REPO);
    await user.click(screen.getByRole("button", { name: "Run a check" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/scan/scan-1"));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/scans");
    expect(JSON.parse(init.body)).toEqual({ repo_url: REPO });
    expect(init.headers["Idempotency-Key"]).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });

  it("shows the API's message, with when the limit resets, and lets the person try again", async () => {
    fetchMock.mockResolvedValue(json(429, { error: { code: "daily_limit_reached", message: "You have used your free scans for today.", resets_at: "2026-10-06T10:00:00Z" } }));
    const user = userEvent.setup();
    render(<ScanForm signedIn />);
    await user.type(screen.getByLabelText("GitHub repository or website"), REPO);
    await user.click(screen.getByRole("button", { name: "Run a check" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/You have used your free scans for today\. Your next free scan is at/);
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Run a check" })).toBeEnabled();
  });

  it("goes to sign-in when the session has expired", async () => {
    fetchMock.mockResolvedValue(json(401, { error: { code: "unauthorized", message: "Please sign in" } }));
    const user = userEvent.setup();
    render(<ScanForm signedIn />);
    await user.type(screen.getByLabelText("GitHub repository or website"), REPO);
    await user.click(screen.getByRole("button", { name: "Run a check" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(`/signin?repo=${encodeURIComponent(REPO)}`));
  });

  it("explains a network failure plainly", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const user = userEvent.setup();
    render(<ScanForm signedIn />);
    await user.type(screen.getByLabelText("GitHub repository or website"), REPO);
    await user.click(screen.getByRole("button", { name: "Run a check" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not reach the scanning service");
  });

  it("prefills the link that was pasted before sign-in", () => {
    render(<ScanForm signedIn initialRepo={REPO} />);
    expect(screen.getByLabelText("GitHub repository or website")).toHaveValue(REPO);
  });
});

const view = (over: object) => ({ id: "scan-1", repo: "acme/shop", status: "running", complete: false, stages: [], tally: { high: 0, medium: 0, low: 0 }, ...over });

describe("ScanRunner", () => {
  it("polls until the scan is done, then shows the report", async () => {
    fetchMock
      .mockResolvedValueOnce(json(200, view({ status: "queued" })))
      .mockResolvedValueOnce(json(200, view({ status: "running" })))
      .mockResolvedValueOnce(json(200, view({ status: "done" })))
      .mockResolvedValueOnce(json(200, report()));
    render(<ScanRunner id="scan-1" pollMs={5} />);
    expect(screen.getByText("Reading your repository")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "acme/shop" })).toBeInTheDocument();
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(["/api/scans/scan-1", "/api/scans/scan-1", "/api/scans/scan-1", "/api/scans/scan-1/report"]);
  });

  it("shows why a scan failed, in the API's words", async () => {
    fetchMock.mockImplementation(async () => json(200, view({ status: "failed", error_code: "repo_not_found", error_message: "We could not find that repository, or it is private." })));
    render(<ScanRunner id="scan-1" pollMs={5} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not find that repository, or it is private.");
    expect(screen.getByRole("link", { name: "Try another scan" })).toHaveAttribute("href", "/");
  });

  it("says plainly when the scan does not exist, with no retry", async () => {
    fetchMock.mockImplementation(async () => json(404, { error: { code: "scan_not_found", message: "We could not find that scan." } }));
    render(<ScanRunner id="scan-1" pollMs={5} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not find that scan.");
    expect(screen.queryByRole("button", { name: "Run a check" })).not.toBeInTheDocument();
  });

  it("sends the person to sign in when the session is gone", async () => {
    fetchMock.mockImplementation(async () => json(401, { error: { code: "unauthorized", message: "Please sign in" } }));
    render(<ScanRunner id="scan-1" pollMs={5} />);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/signin"));
  });

  it("survives a short network failure and keeps polling", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(json(200, view({ status: "done" })))
      .mockResolvedValueOnce(json(200, report()));
    render(<ScanRunner id="scan-1" pollMs={5} />);
    expect(await screen.findByRole("heading", { name: "acme/shop" })).toBeInTheDocument();
  });

  it("gives up with a message after repeated server errors, and offers a retry", async () => {
    fetchMock.mockImplementation(async () => json(500, { error: { code: "internal_error", message: "Something went wrong on our side." } }));
    render(<ScanRunner id="scan-1" pollMs={1} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong on our side.");
    expect(screen.getByRole("button", { name: "Run a check" })).toBeInTheDocument();
  });

  it("rotates the progress line", async () => {
    fetchMock.mockImplementation(async () => json(200, view({ status: "running" }))); // a new Response each call: a body can be read once
    render(<ScanRunner id="scan-1" pollMs={50} />);
    expect(screen.getByRole("status")).toHaveTextContent("Cloning the repository");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Reading your dependencies"), { timeout: 2000 });
  });
});

describe("website checks", () => {
  it("sends a website address to the server like a repository link", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(json(202, { id: "scan-9", status: "queued" }));
    render(<ScanForm signedIn />);
    await user.type(screen.getByLabelText("GitHub repository or website"), "https://yourapp.com");
    await user.click(screen.getByRole("button", { name: "Run a check" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/scan/scan-9"));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ repo_url: "https://yourapp.com" });
  });

  it("keeps a website address while the person signs in", async () => {
    const user = userEvent.setup();
    render(<ScanForm signedIn={false} />);
    await user.type(screen.getByLabelText("GitHub repository or website"), "yourapp.com");
    await user.click(screen.getByRole("button", { name: "Run a check" }));
    expect(push).toHaveBeenCalledWith("/signin?repo=yourapp.com");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tells when the daily website checks come back", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      json(429, { error: { code: "site_daily_limit_reached", message: "You have used today's website checks.", resets_at: "2026-10-08T10:00:00Z" } }),
    );
    render(<ScanForm signedIn />);
    await user.type(screen.getByLabelText("GitHub repository or website"), "yourapp.com");
    await user.click(screen.getByRole("button", { name: "Run a check" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/You have used today's website checks\. You can check again at/);
  });

  it("uses its own words while a website is being read", async () => {
    fetchMock.mockImplementation(async () => json(200, view({ status: "running", kind: "site", repo: "yourapp.com" })));
    render(<ScanRunner id="scan-1" pollMs={5} />);
    expect(await screen.findByText("Reading your website")).toBeInTheDocument();
    expect(screen.queryByText("Reading your repository")).not.toBeInTheDocument();
  });
});