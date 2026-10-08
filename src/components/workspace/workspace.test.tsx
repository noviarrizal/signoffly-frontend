import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { QuotaMeter } from "@/components/workspace/quota-meter";
import { RepoList } from "@/components/workspace/repo-list";
import type { Me, RepoSummary } from "@/lib/api/types";

const repo = (over: Partial<RepoSummary> & { repo: string }): RepoSummary => ({
  path: over.repo,
  kind: "repo",
  scans: 1,
  scores: [],
  latest: { id: "id-" + over.repo, repo: over.repo, status: "done", created_at: "2026-10-08T10:00:00Z" },
  ...over,
});

describe("RepoList", () => {
  it("opens the repository page, and says the score change in words", () => {
    render(
      <RepoList
        repos={[
          repo({ repo: "acme/shop", scans: 3, scores: [40, 63, 81], latest: { id: "s1", repo: "acme/shop", status: "done", verdict: "needs_work", score: 81, created_at: "2026-10-08T10:00:00Z" } }),
          repo({ repo: "you/blog", scans: 2, scores: [48, 43], latest: { id: "s2", repo: "you/blog", status: "done", verdict: "blocked", score: 43, created_at: "2026-10-05T10:00:00Z" } }),
        ]}
      />,
    );
    const shop = screen.getByRole("link", { name: /acme\/shop/ });
    expect(shop).toHaveAttribute("href", "/repo/acme/shop");
    expect(within(shop).getByText("Needs work")).toBeInTheDocument();
    expect(within(shop).getByText("+41 since the first scan")).toBeInTheDocument();
    expect(within(shop).getByText("3 scans")).toBeInTheDocument();
    expect(within(screen.getByRole("link", { name: /you\/blog/ })).getByText("-5 since the first scan")).toBeInTheDocument();
  });

  it("shows a running scan as a status, not as a score", () => {
    render(<RepoList repos={[repo({ repo: "a/b", latest: { id: "s3", repo: "a/b", status: "running", created_at: "2026-10-08T10:00:00Z" } })]} />);
    const row = screen.getByRole("link", { name: /a\/b/ });
    expect(within(row).getByText("Running")).toBeInTheDocument();
    expect(within(row).queryByText(/since the first scan|First scan/)).toBeNull();
  });

  it("marks a website, and never shows a pass for one", () => {
    render(
      <RepoList
        repos={[
          repo({ repo: "yourapp.com", kind: "site", pass_expires_at: "2026-10-22T00:00:00Z", scores: [92], latest: { id: "s4", kind: "site", repo: "yourapp.com", status: "done", verdict: "needs_work", score: 92, created_at: "2026-10-07T10:00:00Z" } }),
          repo({ repo: "acme/shop", pass_expires_at: "2026-10-22T00:00:00Z" }),
        ]}
      />,
    );
    expect(within(screen.getByRole("link", { name: /yourapp\.com/ })).getByText("Website")).toBeInTheDocument();
    expect(within(screen.getByRole("link", { name: /yourapp\.com/ })).queryByText(/Project pass/)).toBeNull();
    expect(within(screen.getByRole("link", { name: /acme\/shop/ })).getByText(/Project pass until/)).toBeInTheDocument();
  });
});

const me = (quota: Partial<Me["quota"]>, site?: Me["site_quota"]): Me => ({ user_id: "u", quota: { limit: 3, used: 0, remaining: 3, ...quota }, site_quota: site, passes: [] });

describe("QuotaMeter", () => {
  it("counts the free scans left, in the singular too", () => {
    const { rerender } = render(<QuotaMeter me={me({ used: 1, remaining: 2 })} />);
    expect(screen.getByText("2 free scans left today")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "1 of 3 free scans used today" })).toBeInTheDocument();
    rerender(<QuotaMeter me={me({ used: 2, remaining: 1 })} />);
    expect(screen.getByText("1 free scan left today")).toBeInTheDocument();
  });

  it("says when more come back, without blocking anything", () => {
    render(<QuotaMeter me={me({ used: 3, remaining: 0, resets_at: "2026-10-08T14:20:00Z" }, { limit: 10, used: 4, remaining: 6 })} />);
    expect(screen.getByText(/No free scans left until/)).toBeInTheDocument();
    expect(screen.getByText("Website checks left today: 6 of 10")).toBeInTheDocument();
  });
});
