"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Category, Report } from "@/lib/api/types";
import { Stamp } from "@/components/report/stamp";
import { ScoreRing } from "@/components/report/score-ring";
import { FindingRow } from "@/components/report/finding-row";
import { SeverityTag } from "@/components/ui/tag";
import { regionShort } from "@/lib/regions";
import { t } from "@/lib/messages";

type Tab = "all" | Category;
const TABS: Tab[] = ["all", "security", "testing", "quality", "legal"];

/** Same text on the server and in the browser, so there is no hydration mismatch: 4 Oct 2026. */
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function ReportView({ report, sample = false }: { report: Report; sample?: boolean }) {
  const [tab, setTab] = useState<Tab>("all");
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isSite = report.kind === "site"; // a website has a host and no code
  const repo = isSite ? report.repo.name : `${report.repo.owner}/${report.repo.name}`;
  const tabs: Tab[] = isSite ? ["all", "security", "legal"] : TABS;

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: report.findings.length, security: 0, testing: 0, quality: 0, legal: 0 };
    for (const f of report.findings) c[f.category] += 1;
    return c;
  }, [report.findings]);
  const shown = tab === "all" ? report.findings : report.findings.filter((f) => f.category === tab);

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    const i = tabs.indexOf(tab);
    const next = e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length] : e.key === "ArrowLeft" ? tabs[(i + tabs.length - 1) % tabs.length] : null;
    if (!next) return;
    e.preventDefault();
    setTab(next);
    refs.current[next]?.focus();
  }

  const gaps = [...report.coverage.analyzers_incomplete.map((id) => ({ id, reason: "" })), ...report.coverage.analyzers_failed];
  const locked = report.access.locked_findings;
  const meta = [`${t("report.scanned")} ${date(report.repo.scanned_at)}`, report.repo.branch, report.repo.commit?.slice(0, 7)].filter(Boolean).join(" · ");

  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-report">
      <header className="flex flex-wrap items-center justify-between gap-6 border-b border-line px-6 py-6 split:px-7">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="break-all font-mono text-[1.1rem] font-medium leading-[1.2]">{repo}</h2>
          <p className="text-[.88rem] text-ink-3">{meta}</p>
        </div>
        <Stamp verdict={report.verdict} subtitle={isSite ? t("report.site.stamp") : report.tally.high > 0 ? `${report.tally.high} high` : undefined} animate={!sample} />
      </header>

      {report.regions.length > 0 && (
        <div role="group" aria-label="Legal regions" className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2 px-6 py-4 split:px-7">
          <span className="mr-[.35rem] text-[.88rem] text-ink-2">{t("report.regions")}</span>
          {report.regions.map((r) => (
            <span key={r} className="rounded-chip border border-ink bg-ink px-[.7rem] py-[.4rem] font-mono text-[.8rem] leading-none text-bg">
              {regionShort(r)}
            </span>
          ))}
        </div>
      )}

      <section className="grid items-center gap-8 px-6 py-7 sm:grid-cols-[auto_1fr] split:px-7" aria-label="Summary">
        <ScoreRing score={report.score} verdict={report.verdict} />
        <div>
          <h3 className="text-[1.6rem] font-medium leading-[1.2] tracking-[-.03em]">{report.summary}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <SeverityTag severity="high" count={report.tally.high} />
            <SeverityTag severity="medium" count={report.tally.medium} />
            <SeverityTag severity="low" count={report.tally.low} />
          </div>
        </div>
      </section>

      {isSite && (
        <section role="note" className="border-t border-line bg-bg px-6 py-5 split:px-7">
          <p className="font-medium">{t("report.site.title")}</p>
          <p className="mt-1 max-w-[62ch] text-[.95rem] text-ink-2">{t("report.site.body")}</p>
          {(report.coverage.notes?.web?.length ?? 0) > 0 && (
            <>
              <p className="mt-4 text-[.88rem] font-medium text-ink-2">{t("report.site.notes")}</p>
              <ul className="mt-2 max-w-[62ch] list-disc space-y-1 pl-5 text-[.9rem] text-ink-2">
                {report.coverage.notes.web.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </>
          )}
          <Link href="/" className="mt-4 inline-block text-[.92rem] font-medium underline underline-offset-4 hover:text-accent">
            {t("report.site.cta")}
          </Link>
        </section>
      )}

      {!report.complete && !isSite && (
        <section role="alert" className="border-t border-line bg-bg px-6 py-5 split:px-7">
          <p className="font-medium">{t("report.incomplete.title")}</p>
          <p className="mt-1 max-w-[62ch] text-[.95rem] text-ink-2">{t("report.incomplete.body")}</p>
          {gaps.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-[.9rem] text-ink-2">
              {gaps.map((g) => (
                <li key={g.id}>
                  <span className="font-mono">{g.id}</span>
                  {g.reason ? `: ${g.reason}` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {locked > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-accent-tint px-6 py-4 split:px-7">
          <p className="text-[.95rem]">{locked === 1 ? t("report.lockedBanner.one") : t("report.lockedBanner", { count: locked })}</p>
          <Link href={`/pricing?repo=${encodeURIComponent(repo)}`} className="whitespace-nowrap text-[.9rem] font-medium underline underline-offset-4">
            {t("report.locked.cta")}
          </Link>
        </div>
      )}

      <div role="tablist" aria-label="Finding categories" className="flex gap-1 overflow-x-auto overflow-y-hidden border-y border-line px-6 split:px-7">
        {tabs.map((id) => {
          const active = tab === id;
          return (
            <button
              key={id}
              ref={(el) => {
                refs.current[id] = el;
              }}
              role="tab"
              id={`${base}-tab-${id}`}
              aria-selected={active}
              aria-controls={`${base}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={onKey}
              className={`-mb-px flex-none whitespace-nowrap border-b-2 px-[.9rem] py-[.95rem] text-[.92rem] transition-colors ${active ? "border-accent text-ink" : "border-transparent text-ink-2 hover:text-ink"}`}
            >
              {t(`tab.${id}`)} <span className="ml-[.35rem] font-mono text-[.78rem] text-ink-3">{counts[id]}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${tab}`}>
        {shown.length === 0 ? (
          <div className="px-6 py-10 split:px-7">
            <p className="text-[1.05rem] font-medium">{t("report.empty")}</p>
            <p className="mt-2 text-[.9rem] text-ink-3">
              {t("report.coverage")}: <span className="font-mono">{report.coverage.analyzers_run.join(", ") || "none"}</span>
            </p>
          </div>
        ) : (
          <ol>
            {shown.map((f) => (
              <FindingRow key={f.fingerprint + f.rule_id} finding={f} repo={repo} />
            ))}
          </ol>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 bg-surface-2 px-6 py-4 text-[.86rem] text-ink-2 split:px-7">
        <span>{report.disclaimer}</span>
        {sample && <span className="font-mono">{t("report.sample")}</span>}
      </footer>
    </article>
  );
}