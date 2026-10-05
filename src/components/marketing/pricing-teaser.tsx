import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { SectionTitle } from "@/components/marketing/section-title";
import { loadCatalog } from "@/lib/catalog";
import { t } from "@/lib/messages";

export async function PricingTeaser() {
  const catalog = await loadCatalog();
  return (
    <section id="pricing" className="scroll-mt-20 pb-[clamp(4.5rem,9vw,8rem)]">
      <Container>
        <Reveal>
          <SectionTitle before={t("pricing.title.before")} emphasis={t("pricing.title.emphasis")} after={t("pricing.title.after")} />
          <p className="mt-4 max-w-[60ch] text-ink-2">{t("pricing.lede")}</p>
        </Reveal>
        <PricingPlans
          catalog={catalog}
          action={
            <ButtonLink href="/pricing" className="!bg-bg !text-ink hover:!bg-accent-tint">
              {t("checkout.start")}
            </ButtonLink>
          }
        />
      </Container>
    </section>
  );
}