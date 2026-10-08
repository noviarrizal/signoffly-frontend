import Link from "next/link";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { auth, signOut } from "@/auth";
import { ButtonLink, Button } from "@/components/ui/button";
import { MobileMenu, type MenuLink } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { t } from "@/lib/messages";

const LINKS = [
  { href: "/#how", key: "nav.how" },
  { href: "/#checks", key: "nav.checks" },
  { href: "/#report", key: "nav.sample" },
  { href: "/pricing", key: "nav.pricing" },
] as const;

// A signed-in person is not being sold to: the page anchors of the landing page give way to their own places.
const SIGNED_IN_LINKS = [
  { href: "/", key: "nav.repos" },
  { href: "/history", key: "nav.history" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/account", key: "nav.account" },
] as const;

const linkClass = "rounded-chip px-[.8rem] py-[.45rem] text-[.9rem] text-ink-2 transition-colors hover:bg-surface hover:text-ink";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export async function Nav() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  const links = signedIn ? SIGNED_IN_LINKS : LINKS;
  const menuLinks: MenuLink[] = [{ href: "/#scan", label: t("scan") }, ...links.map((l) => ({ href: l.href, label: t(l.key) }))];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="relative mx-auto flex h-16 w-[min(1240px,100%-32px)] items-center justify-between gap-4 sm:w-[min(1240px,100%-48px)]">
        <Link href="/" aria-label="Signoffly home" className="inline-flex items-center gap-2 text-[1.2rem] font-semibold tracking-[-.03em]">
          <SealCheck aria-hidden size={22} className="text-accent" />
          {t("brand")}
        </Link>
        <div className="flex items-center gap-[.6rem]">
          <nav aria-label="Main" className="hidden gap-[.15rem] rounded-ctl bg-surface-2 p-1 split:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass}>
                {t(l.key)}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          {signedIn ? (
            <form className="hidden sm:block" action={signOutAction}>
              <Button variant="ghost" size="sm" type="submit">
                {t("nav.signout")}
              </Button>
            </form>
          ) : (
            <ButtonLink href="/signin" variant="ghost" size="sm" className="max-sm:hidden">
              {t("nav.signin")}
            </ButtonLink>
          )}
          <ButtonLink href="/#scan" size="sm" className="max-sm:hidden">
            {t("scan")}
          </ButtonLink>
          <MobileMenu
            links={menuLinks}
            signedIn={signedIn}
            signOut={
              <form action={signOutAction}>
                <Button variant="ghost" className="w-full" type="submit">
                  {t("nav.signout")}
                </Button>
              </form>
            }
          />
        </div>
      </div>
    </header>
  );
}