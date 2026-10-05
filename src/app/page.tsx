import Link from "next/link";
import { LockKey, Flask, Code, Scales } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { ScanForm } from "@/components/scan/scan-form";
import { Container } from "@/components/ui/container";
import { t } from "@/lib/messages";

const STEPS = [1, 2, 3] as const;
const FAQ = [1, 2, 3, 4] as const;

export default async function Home(props: PageProps<"/">) {
  const session = await auth();
  const sp = await props.searchParams;
  const repo = typeof sp.repo === "string" ? sp.repo.slice(0, 300) : "";

  return (
    <>
      <section id="scan" className="pb-[clamp(4.5rem,9vw,8rem)] pt-[clamp(2.5rem,6vw,5rem)]">
        <Container>
          <h1 className="max-w-[16ch] text-[clamp(2.6rem,6.4vw,5.6rem)] font-medium leading-[1.1] tracking-[-.045em]">
            {t("hero.title.before")}{" "}
            <em className="inline-block pb-[.08em] font-medium italic text-accent">{t("hero.title.emphasis")}</em>{" "}
            {t("hero.title.after")}
          </h1>
          <p className="mt-6 max-w-[34ch] text-[1.15rem] leading-[1.5] text-ink-2">{t("hero.sub")}</p>
          <div className="mt-10">
            <ScanForm signedIn={Boolean(session?.user?.id)} initialRepo={repo} />
          </div>
          <p className="mt-6 text-[.95rem]">
            <Link href="#how" className="underline underline-offset-4 hover:text-accent">
              {t("hero.link")}
            </Link>
          </p>
        </Container>
      </section>

      <section id="how" className="pb-[clamp(4.5rem,9vw,8rem)]">
        <Container className="grid gap-10 split:grid-cols-12 split:gap-6">
          <h2 className="text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-.035em] split:col-span-5">{t("how.title")}</h2>
          <ol className="split:col-span-7">
            {STEPS.map((n) => (
              <li key={n} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-line py-6 first:border-t-0 first:pt-0">
                <span className="font-mono text-[.85rem] text-accent">{n}</span>
                <div>
                  <h3 className="text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t(`how.${n}.title`)}</h3>
                  <p className="mt-2 max-w-[48ch] text-ink-2">{t(`how.${n}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="pb-[clamp(4.5rem,9vw,8rem)]">
        <Container className="grid gap-6 split:grid-cols-12">
          <article className="rounded-card border border-line bg-surface p-7 split:col-span-5 split:min-h-[230px]">
            <LockKey aria-hidden size={26} className="text-accent" />
            <h3 className="mt-6 text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("bento.security.title")}</h3>
            <p className="mt-2 max-w-[42ch] text-ink-2">{t("bento.security.body")}</p>
          </article>
          <article className="rounded-card bg-ink p-7 text-bg split:col-span-7 split:min-h-[230px]">
            <Flask aria-hidden size={26} />
            <h3 className="mt-6 text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("bento.testing.title")}</h3>
            <p className="mt-2 max-w-[42ch] opacity-80">{t("bento.testing.body")}</p>
          </article>
          <article className="rounded-card border border-line bg-surface p-7 split:col-span-4 split:min-h-[230px]">
            <Code aria-hidden size={26} className="text-accent" />
            <h3 className="mt-6 text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("bento.quality.title")}</h3>
            <p className="mt-2 max-w-[42ch] text-ink-2">{t("bento.quality.body")}</p>
          </article>
          <article className="rounded-card border border-line bg-accent-tint p-7 split:col-span-8 split:min-h-[230px]">
            <Scales aria-hidden size={26} className="text-accent" />
            <h3 className="mt-6 text-[1.5rem] font-medium leading-[1.15] tracking-[-.025em]">{t("bento.legal.title")}</h3>
            <p className="mt-2 max-w-[52ch] text-ink-2">{t("bento.legal.body")}</p>
          </article>
        </Container>
      </section>

      <section className="pb-[clamp(4.5rem,9vw,8rem)]">
        <Container className="grid gap-10 split:grid-cols-12 split:gap-6">
          <h2 className="text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-.035em] split:col-span-5">{t("faq.title")}</h2>
          <div className="split:col-span-7">
            {FAQ.map((n) => (
              <details key={n} className="group border-t border-line py-5 first:border-t-0 first:pt-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.1rem] font-medium [&::-webkit-details-marker]:hidden">
                  {t(`faq.${n}.q`)}
                  <span aria-hidden className="text-ink-3 transition-transform duration-300 group-open:rotate-180">
                    v
                  </span>
                </summary>
                <p className="mt-3 max-w-[58ch] text-ink-2">{t(`faq.${n}.a`)}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}