import { Link as LinkIcon, MagnifyingGlass, SealCheck } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/marketing/section-title";
import { t } from "@/lib/messages";

const STEPS = [
  { n: 1, Icon: LinkIcon },
  { n: 2, Icon: MagnifyingGlass },
  { n: 3, Icon: SealCheck },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 pb-[clamp(4.5rem,9vw,8rem)]">
      <Container className="grid grid-cols-12 gap-x-6 gap-y-12">
        <Reveal className="col-span-12 split:col-span-5">
          <SectionTitle before={t("how.title.before")} emphasis={t("how.title.emphasis")} after={t("how.title.after")} />
        </Reveal>
        <ol className="col-span-12 split:col-start-7 split:col-end-[-1]">
          {STEPS.map(({ n, Icon }, i) => (
            <li key={n} className="border-t border-line py-7 last:pb-0">
              <Reveal delay={i * 80} className="grid grid-cols-[44px_1fr] gap-x-[1.1rem]">
                <Icon aria-hidden size={26} className="mt-[.15rem] text-accent" />
                <div>
                  <h3 className="text-[1.35rem] font-medium leading-[1.2] tracking-[-.02em]">{t(`how.${n}.title`)}</h3>
                  <p className="mt-[.4rem] max-w-[46ch] text-ink-2">{t(`how.${n}.body`)}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}