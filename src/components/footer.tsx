import Link from "next/link";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { t } from "@/lib/messages";

const LINKS = [
  { href: "/#how", key: "nav.how" },
  { href: "/#checks", key: "nav.checks" },
  { href: "/#report", key: "nav.sample" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/#faq", key: "nav.faq" },
  { href: "/privacy", key: "nav.privacy" },
  { href: "/terms", key: "nav.terms" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-line pb-10 pt-12">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[1.2rem] font-semibold tracking-[-.03em]">
            <SealCheck aria-hidden size={22} className="text-accent" />
            {t("brand")}
          </Link>
          <nav aria-label="Footer" className="flex flex-wrap gap-7 text-[.95rem] text-ink-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-ink">
                {t(l.key)}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 max-w-[70ch] text-[.84rem] text-ink-3">{t("footer.fine")}</p>
      </Container>
    </footer>
  );
}