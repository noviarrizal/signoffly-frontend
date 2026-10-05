"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Report, ScanView } from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import { bff } from "@/components/scan/api";
import { ReportView } from "@/components/report/report-view";
import { ButtonLink, Button } from "@/components/ui/button";
import { t, type MessageKey } from "@/lib/messages";

const POLL_MS = 2000;
const GIVE_UP_MS = 10 * 60 * 1000;
const SLOW_MS = 90 * 1000;
const MICROCOPY: MessageKey[] = ["progress.1", "progress.2", "progress.3", "progress.4", "progress.5"];

type State =
  | { kind: "loading" }
  | { kind: "failed"; message: string }
  | { kind: "error"; message: string; retry: boolean }
  | { kind: "report"; report: Report };

/** `pollMs` is only overridden in tests. */
export function ScanRunner({ id, pollMs = POLL_MS }: { id: string; pollMs?: number }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [line, setLine] = useState(0);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const stopped = useRef(false);

  const fail = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/signin");
        return;
      }
      const message = err instanceof ApiError ? (err.code === "scan_not_found" ? t("error.notFound") : err.message) : t("error.generic");
      setState({ kind: "error", message, retry: !(err instanceof ApiError && err.status === 404) });
    },
    [router],
  );

  // Poll the scan, then fetch the report once it is done.
  useEffect(() => {
    stopped.current = false;
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let errors = 0;

    async function tick() {
      if (stopped.current) return;
      try {
        const view = await bff<ScanView>(`/api/scans/${id}`);
        errors = 0;
        if (view.status === "failed") {
          setState({ kind: "failed", message: view.error_message || t("error.generic") });
          return;
        }
        if (view.status === "done") {
          const report = await bff<Report>(`/api/scans/${id}/report`);
          if (!stopped.current) setState({ kind: "report", report });
          return;
        }
      } catch (err) {
        // A dropped connection or a busy server is retried a few times before we give up.
        if (err instanceof ApiError && (err.code === "network" || err.status >= 500) && ++errors < 4) {
          timer = setTimeout(tick, pollMs * 2);
          return;
        }
        if (!stopped.current) fail(err);
        return;
      }
      if (Date.now() - started > GIVE_UP_MS) {
        fail(new ApiError(0, "timeout", t("progress.slow")));
        return;
      }
      timer = setTimeout(tick, pollMs);
    }
    tick();
    return () => {
      stopped.current = true;
      clearTimeout(timer);
    };
  }, [id, attempt, fail, pollMs]);

  useEffect(() => {
    if (state.kind !== "loading") return;
    const rotate = setInterval(() => setLine((n) => (n + 1) % MICROCOPY.length), 700);
    const slowTimer = setTimeout(() => setSlow(true), SLOW_MS);
    return () => {
      clearInterval(rotate);
      clearTimeout(slowTimer);
    };
  }, [state.kind]);

  function retry() {
    setState({ kind: "loading" });
    setSlow(false);
    setAttempt((n) => n + 1);
  }

  if (state.kind === "report") return <ReportView report={state.report} />;

  if (state.kind === "failed" || state.kind === "error") {
    return (
      <div role="alert" className="rounded-card border border-line bg-surface p-8">
        <h2 className="text-[1.4rem] font-medium tracking-[-.02em]">{t("progress.failed")}</h2>
        <p className="mt-2 max-w-[58ch] text-ink-2">{state.message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {state.kind === "error" && state.retry && <Button onClick={retry}>{t("scan")}</Button>}
          <ButtonLink href="/" variant="ghost">
            {t("progress.retry")}
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-surface p-6 split:p-8" aria-busy="true">
      <h2 className="text-[1.4rem] font-medium tracking-[-.02em]">{t("progress.title")}</h2>
      <p className="mt-3 font-mono text-[.85rem] text-accent" role="status">
        {t(MICROCOPY[line])}
      </p>
      <div className="mt-8 space-y-3" aria-hidden>
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-2/3" />
      </div>
      {slow && (
        <p className="mt-6 text-[.9rem] text-ink-2">
          {t("progress.slow")}{" "}
          <Link href="/account" className="underline underline-offset-4">
            {t("nav.account")}
          </Link>
        </p>
      )}
    </div>
  );
}