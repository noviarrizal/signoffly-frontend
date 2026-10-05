import { auth } from "@/auth";
import { goApiUrl } from "@/lib/env";
import { Checkout } from "@/components/pricing/checkout";
import { Container } from "@/components/ui/container";
import type { Catalog } from "@/lib/api/types";
import { t } from "@/lib/messages";

export const metadata = { title: "Pricing" };

async function loadCatalog(): Promise<Catalog> {
  try {
    const res = await fetch(`${goApiUrl()}/v1/pricing`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (res.ok) return (await res.json()) as Catalog;
  } catch {
    // Fall through: the page still renders, with checkout closed.
  }
  return { pass_days: 14, options: [] };
}

export default async function Pricing(props: PageProps<"/pricing">) {
  const [session, catalog, sp] = await Promise.all([auth(), loadCatalog(), props.searchParams]);
  const repo = typeof sp.repo === "string" ? sp.repo.slice(0, 200) : "";
  const prefilled = repo && !repo.includes("github.com") ? `github.com/${repo}` : repo;
  const points = t("pricing.pass.points").split("|");

  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <h1 className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-.035em]">{t("pricing.title")}</h1>
      <div className="mt-12 grid gap-6 split:grid-cols-12">
        <section className="rounded-card border border-line bg-surface p-7 split:col-span-5">
          <h2 className="text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("pricing.free.title")}</h2>
          <p className="mt-3 max-w-[40ch] text-ink-2">{t("pricing.free.body")}</p>
        </section>
        <section className="rounded-card bg-ink p-7 text-bg split:col-span-7">
          <h2 className="text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("pricing.pass.title")}</h2>
          <p className="mt-3 max-w-[52ch] opacity-80">{t("pricing.pass.body", { days: catalog.pass_days })}</p>
          <ul className="mt-5 space-y-1 text-[.95rem]">
            {points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="mt-8">
            <Checkout catalog={catalog} signedIn={Boolean(session?.user?.id)} initialRepo={prefilled} />
          </div>
        </section>
      </div>
    </Container>
  );
}