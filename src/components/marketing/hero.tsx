import Link from "next/link";
import { ScanForm } from "@/components/scan/scan-form";
import type { ReactNode } from "react";
import { Stamp } from "@/components/report/stamp";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { t } from "@/lib/messages";

export function Hero({ signedIn, initialRepo, quota }: { signedIn: boolean; initialRepo: string; quota?: ReactNode }) {
  return (
    <section id="scan" className="relative overflow-hidden pt-[clamp(2.5rem,6vw,5rem)]">
      {/* A soft pool of the accent tint behind the headline. Decoration only. */}
      <div aria-hidden className="pointer-events-none absolute inset-[-20%_-10%_auto_40%] h-[80%] bg-[radial-gradient(closest-side,var(--accent-tint),transparent_70%)] opacity-70" />
      <Container className="relative">
        <div className="grid grid-cols-12 gap-x-6 gap-y-9 pb-[clamp(3rem,6vw,5.5rem)]">
          <Reveal className="col-span-12 self-end pb-[.9rem] split:col-span-3">
            <Stamp verdict="signed_off" animate />
          </Reveal>
          <Reveal delay={80} className="col-span-12 split:col-start-4 split:col-end-[-1]">
            <h1 className="text-[clamp(2.6rem,6.4vw,5.6rem)] font-medium leading-[1.1] tracking-[-.045em]">
              {t("hero.title.before")}{" "}
              <em className="inline-block pb-[.08em] font-normal italic text-accent">{t("hero.title.emphasis")}</em>
            </h1>
          </Reveal>
          <div aria-hidden className="col-span-full h-px bg-ink/85" />
          <Reveal delay={120} className="col-span-12 split:col-span-5">
            <p className="max-w-[34ch] text-[1.15rem] leading-[1.5] text-ink-2">{t("hero.sub")}</p>
          </Reveal>
          <Reveal delay={180} className="col-span-12 split:col-start-7 split:col-end-[-1]">
            <ScanForm signedIn={signedIn} initialRepo={initialRepo}>
              {quota}
              <p className="mt-1 text-[.92rem]">
                <Link href="#report" className="border-b border-line transition-colors hover:border-accent hover:text-accent">
                  {t("hero.sample")}
                </Link>
              </p>
            </ScanForm>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}