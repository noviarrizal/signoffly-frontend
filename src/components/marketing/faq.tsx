import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/marketing/section-title";
import { t, type MessageKey } from "@/lib/messages";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 pb-[clamp(4.5rem,9vw,8rem)]">
      <Container className="grid grid-cols-12 gap-x-6 gap-y-8">
        <Reveal className="col-span-12 split:col-span-4">
          <SectionTitle before={t("faq.title.before")} emphasis={t("faq.title.emphasis")} />
        </Reveal>
        <Reveal delay={80} className="col-span-12 split:col-start-6 split:col-end-[-1]">
          {[1, 2, 3, 4].map((n) => (
            <details key={n} open={n === 1} className="group border-t border-line py-5 last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.1rem] font-medium tracking-[-.015em] [&::-webkit-details-marker]:hidden">
                {t(`faq.${n}.q` as MessageKey)}
                <CaretDown aria-hidden size={18} className="shrink-0 text-ink-3 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-[58ch] text-ink-2">{t(`faq.${n}.a` as MessageKey)}</p>
            </details>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}