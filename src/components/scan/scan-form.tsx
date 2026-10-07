"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { GithubLogo, Globe } from "@phosphor-icons/react";
import { Button, Spinner } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { bff } from "@/components/scan/api";
import { looksLikeRepoUrl, looksLikeScanTarget, newIdempotencyKey } from "@/lib/validation";
import { t } from "@/lib/messages";

function formatReset(iso: string, code: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return code === "site_daily_limit_reached" ? ` You can check again at ${d.toLocaleString()}.` : ` Your next free scan is at ${d.toLocaleString()}.`;
}

export function ScanForm({ signedIn, initialRepo = "", children }: { signedIn: boolean; initialRepo?: string; children?: ReactNode }) {
  const router = useRouter();
  const id = useId();
  const [repo, setRepo] = useState(initialRepo);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const value = repo.trim();
    if (!looksLikeScanTarget(value)) {
      setError(t("repo.invalid"));
      return;
    }
    setError(null);
    if (!signedIn) {
      router.push(`/signin?repo=${encodeURIComponent(value)}`);
      return;
    }
    setBusy(true);
    try {
      const res = await bff<{ id: string }>("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": newIdempotencyKey() },
        body: JSON.stringify({ repo_url: value }),
      });
      router.push(`/scan/${res.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/signin?repo=${encodeURIComponent(value)}`);
        return;
      }
      const e2 = err instanceof ApiError ? err : null;
      setError((e2?.message ?? t("error.generic")) + (e2 && (e2.code === "daily_limit_reached" || e2.code === "site_daily_limit_reached") && e2.resetsAt ? formatReset(e2.resetsAt, e2.code) : ""));
      setBusy(false);
    }
  }

  const errId = `${id}-error`;
  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label htmlFor={id} className="mb-2 block text-[.88rem] text-ink-2">
        {t("repo.label")}
      </label>
      <div className="flex flex-wrap gap-[.6rem]">
        <div
          className={`flex min-w-0 flex-[1_1_260px] items-center gap-[.6rem] rounded-ctl bg-bg px-[.9rem] transition-[border-color,box-shadow] ${
            error ? "border border-ink ring-2 ring-ink" : "border border-line focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent-tint"
          }`}
        >
          {repo.trim() && !looksLikeRepoUrl(repo) ? (
            <Globe aria-hidden size={18} className="shrink-0 text-ink-3" />
          ) : (
            <GithubLogo aria-hidden size={18} className="shrink-0 text-ink-3" />
          )}
          <input
            id={id}
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={repo}
            onChange={(e) => {
              setRepo(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t("repo.placeholder")}
            aria-invalid={error ? true : undefined}
            aria-describedby={errId}
            className="min-w-0 flex-1 border-0 bg-transparent py-[.85rem] font-mono text-[.9rem] text-ink outline-none placeholder:text-ink-3"
          />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? (
            <>
              <Spinner /> {t("scanning")}
            </>
          ) : (
            t("scan")
          )}
        </Button>
      </div>
      <p id={errId} role="alert" className="mt-2 min-h-[1.4rem] text-[.86rem] font-semibold">
        {error}
      </p>
      {children}
    </form>
  );
}