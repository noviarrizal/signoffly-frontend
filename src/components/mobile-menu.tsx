"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { List, X } from "@phosphor-icons/react";
import { t } from "@/lib/messages";

export interface MenuLink {
  href: string;
  label: string;
}

/**
 * The navigation below 900px. The menu is open only on the page where it was opened, so moving to another
 * page closes it without an effect. Escape and every link close it too, and the button says whether it is open.
 */
export function MobileMenu({ links, signedIn, signOut }: { links: MenuLink[]; signedIn: boolean; signOut: ReactNode }) {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const panel = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenOn(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpenOn(null);
  const item = "block rounded-ctl px-3 py-3 text-[1.05rem] text-ink transition-colors hover:bg-surface-2";

  return (
    <div className="split:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        aria-label={open ? t("nav.menuClose") : t("nav.menu")}
        onClick={() => setOpenOn(open ? null : pathname)}
        className="grid size-[38px] place-items-center rounded-ctl border border-line transition-colors hover:bg-surface-2"
      >
        {open ? <X size={18} /> : <List size={18} />}
      </button>

      {open && (
        <div id={panel} className="absolute inset-x-0 top-full border-b border-line bg-bg px-4 pb-5 pt-3 sm:px-6">
          <nav aria-label="Menu" className="mx-auto max-w-[1240px]">
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={close} className={item}>
                    {l.label}
                  </Link>
                </li>
              ))}
              {!signedIn && (
                <li>
                  <Link href="/signin" onClick={close} className={item}>
                    {t("nav.signin")}
                  </Link>
                </li>
              )}
            </ul>
            {signedIn && <div className="mt-2 border-t border-line pt-3">{signOut}</div>}
          </nav>
        </div>
      )}
    </div>
  );
}