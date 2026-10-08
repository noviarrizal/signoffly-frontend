import Link from "next/link";
import { LocalTime } from "@/components/workspace/local-time";
import { MiniStamp } from "@/components/workspace/mini-stamp";
import { Sparkline } from "@/components/workspace/sparkline";
import type { RepoSummary } from "@/lib/api/types";
import { t, type MessageKey } from "@/lib/messages";
import { hasPass, scoreDelta } from "@/lib/workspace";

function deltaText(scores: number[]): string {
  const d = scoreDelta(scores);
  if (d.kind === "up") return t("workspace.delta.up", { n: d.by });
  if (d.kind === "down") return t("workspace.delta.down", { n: d.by });
  return t(`workspace.delta.${d.kind}` as MessageKey);
}

/** One line per repository, separated by hairlines. Each line opens the repository page. */
export function RepoList({ repos }: { repos: RepoSummary[] }) {
  return (
    <ul className="mt-6 border-b border-line">
      {repos.map((r) => {
        const latest = r.latest;
        const scored = latest.verdict && typeof latest.score === "number";
        return (
          <li key={r.repo} className="border-t border-line">
            <Link
              href={`/repo/${r.path.split("/").map(encodeURIComponent).join("/")}`}
              className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 py-5 transition-colors hover:bg-surface split:grid-cols-[minmax(0,1.5fr)_8.5rem_10.5rem_9rem_11rem] split:px-3"
            >
              <span className="col-span-2 min-w-0 split:col-span-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="break-all font-mono text-[1rem]">{r.repo}</span>
                  {r.kind === "site" && <span className="rounded-chip border border-line px-2 py-[.15rem] font-mono text-[.72rem] leading-none text-ink-2">{t("history.site")}</span>}
                </span>
                <span className="mt-1 block text-[.86rem] text-ink-3">{r.scans === 1 ? t("workspace.scan1") : t("workspace.scans", { n: r.scans })}</span>
              </span>

              <span className="justify-self-start">
                {latest.verdict ? <MiniStamp verdict={latest.verdict} /> : <span className="text-[.88rem] text-ink-3">{t(`history.status.${latest.status === "done" ? "failed" : latest.status}` as MessageKey)}</span>}
              </span>

              <span className="justify-self-end text-right split:justify-self-start split:text-left">
                {scored ? (
                  <>
                    <span className="block text-[1.6rem] font-medium leading-none tabular-nums tracking-[-.02em]">
                      {latest.score}
                      <span className="sr-only"> {t("workspace.outOf")}</span>
                    </span>
                    <span className="mt-1 block text-[.84rem] text-ink-3">{deltaText(r.scores)}</span>
                  </>
                ) : null}
              </span>

              <span className="hidden justify-self-center split:block" role="img" aria-label={t("workspace.trend")}>
                <Sparkline scores={r.scores} />
              </span>

              <span className="col-span-2 text-[.86rem] leading-[1.5] text-ink-3 split:col-span-1 split:text-right">
                <span className="block">
                  {t("workspace.lastScan")} <LocalTime iso={latest.created_at} format="date" />
                </span>
                {hasPass(r) && r.pass_expires_at && (
                  <span className="block text-ink-2">
                    {t("workspace.pass")} <LocalTime iso={r.pass_expires_at} format="date" />
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
