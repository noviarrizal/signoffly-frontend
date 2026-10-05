import { auth } from "@/auth";
import { Checkout } from "@/components/pricing/checkout";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { SectionTitle } from "@/components/marketing/section-title";
import { Container } from "@/components/ui/container";
import { loadCatalog } from "@/lib/catalog";
import { t } from "@/lib/messages";

export const metadata = { title: "Pricing" };

export default async function Pricing(props: PageProps<"/pricing">) {
  const [session, catalog, sp] = await Promise.all([auth(), loadCatalog(), props.searchParams]);
  const repo = typeof sp.repo === "string" ? sp.repo.slice(0, 200) : "";
  const prefilled = repo && !repo.includes("github.com") ? `github.com/${repo}` : repo;

  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <SectionTitle as="h1" before={t("pricing.title.before")} emphasis={t("pricing.title.emphasis")} after={t("pricing.title.after")} className="max-w-[20ch]" />
      <p className="mt-4 max-w-[60ch] text-ink-2">{t("pricing.lede")}</p>
      <PricingPlans catalog={catalog} action={<Checkout catalog={catalog} signedIn={Boolean(session?.user?.id)} initialRepo={prefilled} />} />
    </Container>
  );
}