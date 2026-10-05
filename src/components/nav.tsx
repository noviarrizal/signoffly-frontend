import Link from "next/link";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { auth, signOut } from "@/auth";
import { ButtonLink, Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { t } from "@/lib/messages";

export async function Nav() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-[2px]">
      <div className="mx-auto flex h-16 w-[min(1240px,100%-32px)] items-center justify-between gap-4 sm:w-[min(1240px,100%-48px)]">
        <Link href="/" className="flex items-center gap-2 text-[1.05rem] font-semibold tracking-[-.02em]">
          <SealCheck aria-hidden size={24} weight="regular" className="text-accent" />
          {t("brand")}
        </Link>
        <nav aria-label="Main" className="hidden rounded-ctl bg-surface-2 p-1 split:flex">
          <Link href="/pricing" className="rounded-chip px-3 py-1.5 text-[.9rem] text-ink-2 transition-colors hover:bg-bg hover:text-ink">
            {t("nav.pricing")}
          </Link>
          {signedIn && (
            <Link href="/account" className="rounded-chip px-3 py-1.5 text-[.9rem] text-ink-2 transition-colors hover:bg-bg hover:text-ink">
              {t("nav.account")}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {signedIn ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                {t("nav.signout")}
              </Button>
            </form>
          ) : (
            <ButtonLink href="/signin" variant="ghost" size="sm">
              {t("nav.signin")}
            </ButtonLink>
          )}
          <ButtonLink href="/#scan" size="sm">
            {t("scan")}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}