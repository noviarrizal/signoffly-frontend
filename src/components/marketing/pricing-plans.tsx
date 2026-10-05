import type { ReactNode } from "react";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import type { Catalog } from "@/lib/api/types";
import { t, type MessageKey } from "@/lib/messages";

const plan = "flex flex-col gap-4 rounded-card border p-8";

/** The free plan and the project pass. The pass shows the prices the API says can be paid today. */
export function PricingPlans({ catalog, action }: { catalog: Catalog; action: ReactNode }) {
  return (
    <div className="mt-12 grid grid-cols-12 gap-4">
      <Reveal className="col-span-12 split:col-span-5">
        <article className={`${plan} h-full border-line bg-surface`}>
          <h3 className="text-[1.2rem] font-medium">{t("pricing.free.title")}</h3>
          <p className="text-[3rem] font-medium leading-none tracking-[-.05em]">{t("pricing.free.price")}</p>
          <ul className="my-2 grid gap-[.6rem]">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex items-start gap-[.6rem] text-ink-2">
                <Check aria-hidden size={18} className="mt-[.2rem] shrink-0 text-accent" />
                {t(`pricing.free.${n}` as MessageKey)}
              </li>
            ))}
          </ul>
        </article>
      </Reveal>

      <Reveal delay={100} className="col-span-12 split:col-span-7">
        <article className={`${plan} h-full border-ink bg-ink text-bg`}>
          <h3 className="text-[1.2rem] font-medium">{t("pricing.pass.title")}</h3>
          {catalog.options.length > 0 ? (
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              {catalog.options.map((o) => (
                <p key={o.currency} className="text-[3rem] font-medium leading-none tracking-[-.05em]">
                  {o.display}
                </p>
              ))}
              <p className="text-base opacity-70">{t("pricing.pass.per", { days: catalog.pass_days })}</p>
            </div>
          ) : (
            <p className="text-[1.6rem] font-medium leading-tight tracking-[-.03em]">{t("pricing.pass.fallback", { days: catalog.pass_days })}</p>
          )}
          <ul className="my-2 grid gap-[.6rem]">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-start gap-[.6rem] opacity-85">
                <Check aria-hidden size={18} className="mt-[.2rem] shrink-0 text-accent-tint" />
                {t(`pricing.pass.${n}` as MessageKey)}
              </li>
            ))}
          </ul>
          <div className="mt-auto">{action}</div>
        </article>
      </Reveal>
    </div>
  );
}