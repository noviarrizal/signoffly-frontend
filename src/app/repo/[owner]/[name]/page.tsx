import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { LocalTime } from "@/components/workspace/local-time";
import { MiniStamp } from "@/components/workspace/mini-stamp";
import { QuotaMeter } from "@/components/workspace/quota-meter";
import { RescanButton } from "@/components/workspace/rescan-button";
import { ScoreChart } from "@/components/workspace/score-chart";
import { ApiError } from "@/lib/api/errors";
import { userFetch } from "@/lib/api/user";
import type { Me, RepoDetail } from "@/lib/api/types";
import { t, type MessageKey } from "@/lib/messages";
import { PRIVATE } from "@/lib/site";
import { chartScans, rescanTarget, scoreDelta } from "@/lib/workspace";

export const metadata = { title: "Repository", ...PRIVATE };

export default async function RepoPage(props: PageProps<"/repo/[owner]/[name]">) {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/signin");

  const params = await props.params;
  let owner: string;
  let name: string;
  try {
    owner = decodeURIComponent(params.owner);
    name = decodeURIComponent(params.name);
  } catch {
    notFound();
  }

  let detail: RepoDetail;
  try {
    detail = await userFetch<RepoDetail>(userId, `/v1/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const me = await userFetch<Me>(userId, "/v1/me").catch(() => null);

  const scored = chartScans(detail.scans);
  const latest = detail.scans[0];
  const site = detail.kind === "site";
  const delta = scoreDelta(scored.map((s) => s.score));
  const deltaText =
    delta.kind === "up" ? t("workspace.delta.up", { n: delta.by }) : delta.kind === "down" ? t("workspace.delta.down", { n: delta.by }) : t(`workspace.delta.${delta.kind}` as MessageKey);

  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <Link href="/" className="text-[.92rem] text-ink-2 underline-offset-4 hover:text-accent hover:underline">
        {t("repo.back")}
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
        <div className="min-w-0">
          <h1 className="break-all text-[clamp(1.8rem,3.6vw,2.8rem)] font-medium leading-[1.15] tracking-[-.03em]">{detail.repo}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {latest.verdict ? <MiniStamp verdict={latest.verdict} /> : <span className="text-ink-3">{t(`history.status.${latest.status === "done" ? "failed" : latest.status}` as MessageKey)}</span>}
            {typeof latest.score === "number" && (
              <span>
                <span className="text-[1.6rem] font-medium tabular-nums tracking-[-.02em]">{latest.score}</span>
                <span className="sr-only"> {t("workspace.outOf")}</span>
                <span className="ml-3 text-[.9rem] text-ink-3">{deltaText}</span>
              </span>
            )}
          </div>
        </div>
        <div className="max-w-[24rem]">
          <RescanButton target={rescanTarget(detail.path, detail.kind)} site={site} />
          <div className="mt-3 text-[.9rem] text-ink-2">
            {detail.pass_expires_at ? (
              <span>
                {t("repo.passNote")} <LocalTime iso={detail.pass_expires_at} format="date" />
              </span>
            ) : (
              me && <QuotaMeter me={me} />
            )}
          </div>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="chart-title">
        <h2 id="chart-title" className="text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">
          {t("repo.chart.title")}
        </h2>
        <div className="mt-6 max-w-[50rem]">
          {scored.length >= 2 ? (
            <>
              <ScoreChart scans={scored} />
              <p className="mt-2 max-w-[60ch] text-[.86rem] text-ink-3">{t("repo.chart.note")}</p>
            </>
          ) : (
            <p className="text-ink-2">{t("repo.chart.few")}</p>
          )}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="scans-title">
        <h2 id="scans-title" className="text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">
          {t("repo.scans")}
        </h2>
        <ul className="mt-4 border-b border-line">
          {detail.scans.map((s) => (
            <li key={s.id} className="border-t border-line">
              <Link
                href={`/scan/${s.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-4 transition-colors hover:bg-surface split:grid-cols-[11rem_9rem_5rem_1fr] split:px-3"
              >
                <span className="text-[.95rem]">
                  <LocalTime iso={s.created_at} format="datetime" />
                </span>
                <span className="justify-self-end split:justify-self-start">
                  {s.verdict ? <MiniStamp verdict={s.verdict} /> : <span className="text-[.88rem] text-ink-3">{t(`history.status.${s.status === "done" ? "failed" : s.status}` as MessageKey)}</span>}
                </span>
                <span className="text-[1.1rem] font-medium tabular-nums">
                  {typeof s.score === "number" ? (
                    <>
                      {s.score}
                      <span className="sr-only"> {t("workspace.outOf")}</span>
                    </>
                  ) : null}
                </span>
                <span className="col-span-2 text-[.88rem] text-ink-3 split:col-span-1">{s.verdict ? t("repo.counts", { high: s.counts.high, medium: s.counts.medium, low: s.counts.low }) : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
