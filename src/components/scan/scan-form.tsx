"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { GithubLogo } from "@phosphor-icons/react";
import { Button, Spinner } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { bff } from "@/components/scan/api";
import { looksLikeRepoUrl, newIdempotencyKey } from "@/lib/validation";
import { t } from "@/lib/messages";

function formatReset(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : ` Your next free scan is at ${d.toLocaleString()}.`;
}

export function ScanForm({ signedIn, initialRepo = "" }: { signedIn: boolean; initialRepo?: string }) {
  const router = useRouter();
  const id = useId();
  const [repo, setRepo] = useState(initialRepo);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const value = repo.trim();
    if (!looksLikeRepoUrl(value)) {
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
      setError((e2?.message ?? t("error.generic")) + (e2?.code === "daily_limit_reached" && e2.resetsAt ? formatReset(e2.resetsAt) : ""));
      setBusy(false);
    }
  }

  const errId = `${id}-error`;
  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-[40rem]">
      <label htmlFor={id} className="mb-2 block text-[.9rem] font-medium">
        {t("repo.label")}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <GithubLogo aria-hidden size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
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
            aria-describedby={error ? errId : undefined}
            className={`w-full rounded-ctl bg-bg py-3 pl-10 pr-3 font-mono text-[.9rem] outline-none transition-shadow placeholder:text-ink-3 ${error ? "border border-ink ring-2 ring-ink" : "border border-line focus:border-accent focus:ring-[3px] focus:ring-accent-tint"}`}
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
      {error && (
        <p id={errId} role="alert" className="mt-2 text-[.9rem] font-semibold">
          {error}
        </p>
      )}
    </form>
  );
}