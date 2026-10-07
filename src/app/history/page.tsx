import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/marketing/section-title";
import { userFetch } from "@/lib/api/user";
import { olderCursor, PAGE_SIZE, parseBefore } from "@/lib/history";
import type { ScanSummary } from "@/lib/api/types";
import { t, type MessageKey } from "@/lib/messages";
import { PRIVATE } from "@/lib/site";

export const metadata = { title: "History", ...PRIVATE };

const when = (iso: string) => new Date(iso).toLocaleString();

export default async function History(props: PageProps<"/history">) {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/signin");

  const sp = await props.searchParams;
  const before = parseBefore(sp.before);
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (before) query.set("before", before);

  let scans: ScanSummary[] = [];
  let failed = false;
  try {
    scans = (await userFetch<{ scans: ScanSummary[] | null }>(userId, `/v1/scans?${query}`)).scans ?? [];
  } catch {
    failed = true;
  }
  const older = olderCursor(scans);

  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <SectionTitle as="h1" before={t("history.title")} />

      {failed ? (
        <p role="alert" className="mt-8 text-ink-2">
          {t("account.error")}
        </p>
      ) : scans.length === 0 ? (
        <p className="mt-8 text-ink-2">{t("history.empty")}</p>
      ) : (
        <ul className="mt-10 max-w-[56rem]">
          {scans.map((s) => (
            <li key={s.id} className="border-t border-line first:border-t-0">
              <Link href={`/scan/${s.id}`} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-4 transition-colors hover:text-accent">
                <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="break-all font-mono text-[.95rem]">{s.repo}</span>
                  {s.kind === "site" && <span className="rounded-chip border border-line px-2 py-[.15rem] font-mono text-[.72rem] leading-none text-ink-2">{t("history.site")}</span>}
                </span>
                <span className="flex flex-wrap items-center gap-x-4 text-[.88rem] text-ink-3">
                  {s.verdict ? (
                    <span>
                      {t(`verdict.${s.verdict}` as MessageKey)}
                      {typeof s.score === "number" ? `, ${t("history.score", { score: s.score })}` : ""}
                    </span>
                  ) : (
                    <span>{t(`history.status.${s.status === "done" ? "failed" : s.status}` as MessageKey)}</span>
                  )}
                  <span>{when(s.created_at)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap gap-6 text-[.95rem]">
        {before && (
          <Link href="/history" className="underline underline-offset-4 hover:text-accent">
            {t("history.newest")}
          </Link>
        )}
        {older && (
          <Link href={`/history?before=${encodeURIComponent(older)}`} className="underline underline-offset-4 hover:text-accent">
            {t("history.older")}
          </Link>
        )}
      </div>
    </Container>
  );
}