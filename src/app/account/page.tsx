import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { SeverityTag } from "@/components/ui/tag";
import { userFetch } from "@/lib/api/user";
import type { Me, Order, ScanSummary } from "@/lib/api/types";
import { t, type MessageKey } from "@/lib/messages";

export const metadata = { title: "Account" };

const fmt = (iso: string) => new Date(iso).toLocaleString();

export default async function Account() {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/signin");

  let data: { me: Me; scans: ScanSummary[]; orders: Order[] } | null = null;
  try {
    const [me, scans, orders] = await Promise.all([
      userFetch<Me>(userId, "/v1/me"),
      userFetch<{ scans: ScanSummary[] }>(userId, "/v1/scans?limit=10"),
      userFetch<{ orders: Order[] | null }>(userId, "/v1/orders"),
    ]);
    data = { me, scans: scans.scans ?? [], orders: orders.orders ?? [] };
  } catch {
    data = null;
  }
  if (!data) {
    return (
      <Container className="py-[clamp(2.5rem,6vw,5rem)]">
        <p role="alert">{t("account.error")}</p>
      </Container>
    );
  }
  const { me, scans, orders } = data;

  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <h1 className="text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-.035em]">{t("account.title")}</h1>

      <section className="mt-12 grid gap-10 split:grid-cols-12 split:gap-6">
        <div className="split:col-span-5">
          <h2 className="text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("account.quota")}</h2>
          <p className="mt-3 font-mono text-[1.1rem]">{t("account.quota.value", { used: me.quota.used, limit: me.quota.limit })}</p>
          {me.quota.resets_at && <p className="mt-1 text-[.9rem] text-ink-3">{t("account.quota.resets", { time: fmt(me.quota.resets_at) })}</p>}
          <h2 className="mt-10 text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("account.data.title")}</h2>
          <p className="mt-3 max-w-[40ch] text-[.95rem] text-ink-2">{t("account.data.body")}</p>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[.95rem]">
            <a href="/api/me/export" download className="underline underline-offset-4 hover:text-accent">
              {t("account.data.export")}
            </a>
            <Link href="/account/delete" className="underline underline-offset-4 hover:text-accent">
              {t("account.data.delete")}
            </Link>
          </p>

          <h2 className="mt-10 text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("account.passes")}</h2>
          {me.passes.length === 0 ? (
            <p className="mt-3 text-ink-2">{t("account.passes.none")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {me.passes.map((p) => (
                <li key={p.repo + p.expires_at} className="text-[.95rem]">
                  <span className="font-mono">{p.repo}</span> <span className="text-ink-3">{t("account.passes.until", { date: fmt(p.expires_at) })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="split:col-span-7">
          <h2 className="text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("account.scans")}</h2>
          {scans.length === 0 ? (
            <p className="mt-3 text-ink-2">{t("account.scans.none")}</p>
          ) : (
            <ul className="mt-3">
              {scans.map((s) => (
                <li key={s.id} className="border-t border-line first:border-t-0">
                  <Link href={`/scan/${s.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-accent">
                    <span className="break-all font-mono text-[.9rem]">{s.repo}</span>
                    <span className="flex items-center gap-3 text-[.85rem] text-ink-3">
                      {s.verdict && <span>{t(`verdict.${s.verdict}` as MessageKey)}</span>}
                      {s.status === "failed" && <SeverityTag severity="low" />}
                      <span>{fmt(s.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-[.95rem]">
            <Link href="/history" className="underline underline-offset-4 hover:text-accent">
              {t("history.all")}
            </Link>
          </p>

          <h2 className="mt-10 text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("account.orders")}</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-ink-2">{t("account.orders.none")}</p>
          ) : (
            <ul className="mt-3">
              {orders.map((o) => (
                <li key={o.id} className="border-t border-line py-4 first:border-t-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[.9rem]">{o.repo}</span>
                    <span className="text-[.85rem] text-ink-3">{t(`account.order.${o.status}` as MessageKey)}</span>
                  </div>
                  {o.status === "pending" && (
                    <p className="mt-2 text-[.9rem] text-ink-2">
                      {t("checkout.reference")}: <span className="font-mono">{o.payment.reference}</span> · {t("checkout.amount")}: <span className="font-mono">{o.payment.display}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Container>
  );
}