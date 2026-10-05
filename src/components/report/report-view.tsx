"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Category, Report } from "@/lib/api/types";
import { Stamp } from "@/components/report/stamp";
import { ScoreRing } from "@/components/report/score-ring";
import { FindingRow } from "@/components/report/finding-row";
import { SeverityTag } from "@/components/ui/tag";
import { regionList } from "@/lib/regions";
import { t } from "@/lib/messages";

type Tab = "all" | Category;
const TABS: Tab[] = ["all", "security", "testing", "quality", "legal"];

export function ReportView({ report }: { report: Report }) {
  const [tab, setTab] = useState<Tab>("all");
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const repo = `${report.repo.owner}/${report.repo.name}`;

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: report.findings.length, security: 0, testing: 0, quality: 0, legal: 0 };
    for (const f of report.findings) c[f.category] += 1;
    return c;
  }, [report.findings]);
  const shown = tab === "all" ? report.findings : report.findings.filter((f) => f.category === tab);

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    const i = TABS.indexOf(tab);
    const next = e.key === "ArrowRight" ? TABS[(i + 1) % TABS.length] : e.key === "ArrowLeft" ? TABS[(i + TABS.length - 1) % TABS.length] : null;
    if (!next) return;
    e.preventDefault();
    setTab(next);
    refs.current[next]?.focus();
  }

  const gaps = [
    ...report.coverage.analyzers_incomplete.map((id) => ({ id, reason: "" })),
    ...report.coverage.analyzers_failed,
  ];
  const locked = report.access.locked_findings;

  return (
    <article className="rounded-card border border-line bg-surface shadow-report">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line p-6 split:p-8">
        <div className="min-w-0">
          <h2 className="break-all font-mono text-[1.15rem] font-medium">{repo}</h2>
          <p className="mt-1 font-mono text-[.8rem] text-ink-3">
            {t("report.scanned")} {new Date(report.repo.scanned_at).toLocaleString()}
            {report.repo.branch ? ` · ${report.repo.branch}` : ""}
            {report.repo.commit ? ` · ${report.repo.commit.slice(0, 7)}` : ""}
          </p>
          {report.regions.length > 0 && (
            <p className="mt-3 text-[.9rem] text-ink-2">
              <span className="font-medium">{t("report.regions")}:</span> {regionList(report.regions)}
            </p>
          )}
        </div>
        <Stamp verdict={report.verdict} animate />
      </header>

      <section className="flex flex-wrap items-center gap-6 border-b border-line p-6 split:gap-10 split:p-8" aria-label="Summary">
        <ScoreRing score={report.score} verdict={report.verdict} />
        <div className="min-w-[16rem] flex-1">
          <h3 className="text-[1.6rem] font-medium leading-[1.2] tracking-[-.03em]">{report.summary}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <SeverityTag severity="high" count={report.tally.high} />
            <SeverityTag severity="medium" count={report.tally.medium} />
            <SeverityTag severity="low" count={report.tally.low} />
          </div>
        </div>
      </section>

      {!report.complete && (
        <section role="alert" className="border-b border-line bg-bg p-6 split:px-8">
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-accent-tint px-6 py-4 split:px-8">
          <p className="text-[.95rem]">{locked === 1 ? t("report.lockedBanner.one") : t("report.lockedBanner", { count: locked })}</p>
          <Link href={`/pricing?repo=${encodeURIComponent(repo)}`} className="whitespace-nowrap text-[.9rem] font-medium underline underline-offset-4">
            {t("report.locked.cta")}
          </Link>
        </div>
      )}

      <div className="px-6 pt-2 split:px-8">
        <div role="tablist" aria-label="Finding categories" className="flex gap-1 overflow-x-auto border-b border-line">
          {TABS.map((id) => {
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
                className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-[.95rem] transition-colors ${active ? "border-accent text-ink" : "border-transparent text-ink-2 hover:text-ink"}`}
              >
                {t(`tab.${id}`)} <span className="ml-1 font-mono text-[.75rem] text-ink-3">{counts[id]}</span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${tab}`}>
          {shown.length === 0 ? (
            <div className="py-10">
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
      </div>

      <footer className="border-t border-line px-6 py-4 text-[.85rem] text-ink-3 split:px-8">{report.disclaimer}</footer>
    </article>
  );
}