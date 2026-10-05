import Link from "next/link";
import { t } from "@/lib/messages";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-[min(1240px,100%-32px)] flex-wrap items-center justify-between gap-4 py-8 text-[.85rem] text-ink-3 sm:w-[min(1240px,100%-48px)]">
        <div className="flex items-center gap-5">
          <span className="font-medium text-ink">{t("brand")}</span>
          <Link href="/pricing" className="hover:text-ink">
            {t("nav.pricing")}
          </Link>
        </div>
        <p>{t("footer.disclaimer")}</p>
      </div>
    </footer>
  );
}