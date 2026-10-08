"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { bff } from "@/components/scan/api";
import { newIdempotencyKey } from "@/lib/validation";
import { t } from "@/lib/messages";

/** Starts a new scan of this repository or website and opens its progress page. */
export function RescanButton({ target, site }: { target: string; site: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await bff<{ id: string }>("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": newIdempotencyKey() },
        body: JSON.stringify({ repo_url: target }),
      });
      router.push(`/scan/${res.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/signin");
        return;
      }
      setError(err instanceof ApiError ? err.message : t("error.generic"));
      setBusy(false);
    }
  }

  return (
    <div>
      <Button type="button" onClick={run} disabled={busy}>
        {busy ? (
          <>
            <Spinner /> {t("scanning")}
          </>
        ) : (
          t(site ? "repo.recheck" : "repo.rescan")
        )}
      </Button>
      <p role="alert" className="mt-2 text-[.86rem] font-semibold empty:hidden">
        {error}
      </p>
    </div>
  );
}
