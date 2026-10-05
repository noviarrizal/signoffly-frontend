import { Code, Database, Flask, Key, Package, Scales, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/marketing/section-title";
import { t } from "@/lib/messages";

const REGIONS = ["UU PDP", "GDPR", "CCPA", "PDPA"];

/** Testing and code quality are not built yet, and the page says so rather than implying they are. */
function Soon({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className={`inline-block self-start rounded-chip border px-2 py-1 font-mono text-[.72rem] ${onDark ? "border-bg/40" : "border-ink/30"}`}>
      {t("checks.soon")}
    </span>
  );
}

const cell = "flex min-h-[230px] flex-col gap-3 overflow-hidden rounded-card border p-7";

export function Checks() {
  return (
    <section id="checks" className="scroll-mt-20 pb-[clamp(4.5rem,9vw,8rem)]">
      <Container>
        <Reveal>
          <SectionTitle before={t("checks.title.before")} emphasis={t("checks.title.emphasis")} after={t("checks.title.after")} />
          <p className="mt-4 max-w-[60ch] text-ink-2">{t("checks.lede")}</p>
        </Reveal>

        {/* Exactly four cells: 5 + 7 on top, then legal spans two rows beside 4 + 3. */}
        <div className="mt-12 grid grid-cols-12 gap-4">
          <Reveal className="col-span-12 split:col-span-5 split:row-span-2">
            <article className={`${cell} h-full justify-between border-transparent bg-accent-tint`}>
              <div>
                <Scales aria-hidden size={26} className="text-accent" />
                <h3 className="mt-[.9rem] text-2xl font-medium leading-[1.15] tracking-[-.025em]">{t("checks.legal.title")}</h3>
                <p className="mt-3 max-w-[42ch]">{t("checks.legal.body")}</p>
              </div>
              <div>
                <ul className="mb-[.9rem] flex flex-wrap gap-2">
                  {REGIONS.map((r) => (
                    <li key={r} className="rounded-chip border border-ink/20 px-[.7rem] py-[.4rem] font-mono text-[.8rem] leading-none">
                      {r}
                    </li>
                  ))}
                </ul>
                <p className="text-[.86rem] text-ink-2">{t("checks.legal.note")}</p>
              </div>
            </article>
          </Reveal>

          <Reveal delay={80} className="col-span-12 split:col-span-7">
            <article className={`${cell} h-full border-line bg-surface`}>
              <ShieldCheck aria-hidden size={26} className="text-accent" />
              <h3 className="text-2xl font-medium leading-[1.15] tracking-[-.025em]">{t("checks.security.title")}</h3>
              <p className="max-w-[42ch] text-ink-2">{t("checks.security.body")}</p>
              <ul className="mt-auto grid gap-2">
                {([Key, Package, Database] as const).map((Icon, i) => (
                  <li key={i} className="flex items-center gap-[.6rem] text-[.95rem] text-ink-2">
                    <Icon aria-hidden size={18} className="text-ink-3" />
                    {t(`checks.security.${i + 1}` as "checks.security.1")}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>

          <Reveal delay={120} className="col-span-12 split:col-span-4">
            <article className={`${cell} h-full border-ink bg-ink text-bg`}>
              <Flask aria-hidden size={26} className="text-accent-tint" />
              <h3 className="text-2xl font-medium leading-[1.15] tracking-[-.025em]">{t("checks.testing.title")}</h3>
              <p className="max-w-[42ch] opacity-80">{t("checks.testing.body")}</p>
              <div className="mt-auto">
                <Soon onDark />
              </div>
            </article>
          </Reveal>

          <Reveal delay={160} className="col-span-12 split:col-span-3">
            <article className={`${cell} h-full border-line bg-[linear-gradient(160deg,var(--surface)_20%,var(--accent-tint))]`}>
              <Code aria-hidden size={26} className="text-accent" />
              <h3 className="text-2xl font-medium leading-[1.15] tracking-[-.025em]">{t("checks.quality.title")}</h3>
              <p className="max-w-[42ch] text-ink-2">{t("checks.quality.body")}</p>
              <div className="mt-auto">
                <Soon />
              </div>
            </article>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}