import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/marketing/section-title";
import { deleteAccount } from "@/app/account/delete/actions";
import { DELETE_PHRASE } from "@/lib/delete-account";
import { t, type MessageKey } from "@/lib/messages";

export const metadata = { title: "Delete account" };

export default async function DeleteAccount(props: PageProps<"/account/delete">) {
  if (!(await auth())?.user?.id) redirect("/signin");
  const sp = await props.searchParams;
  const error = sp.error === "confirm" || sp.error === "failed" ? sp.error : "";

  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <SectionTitle as="h1" before={t("delete.title")} />
      <p className="mt-4 max-w-[60ch] text-ink-2">{t("delete.lede")}</p>

      <ul className="mt-8 max-w-[60ch] list-disc space-y-2 pl-5 text-ink-2">
        {([1, 2, 3, 4] as const).map((n) => (
          <li key={n}>{t(`delete.item.${n}` as MessageKey)}</li>
        ))}
      </ul>

      <p className="mt-6 max-w-[60ch]">
        <Link href="/api/me/export" prefetch={false} className="underline underline-offset-4 hover:text-accent">
          {t("account.data.export")}
        </Link>{" "}
        <span className="text-ink-3">{t("delete.exportFirst")}</span>
      </p>

      <form action={deleteAccount} className="mt-10 max-w-[28rem]">
        <label htmlFor="confirm" className="mb-2 block text-[.9rem] font-medium">
          {t("delete.confirm.label", { phrase: DELETE_PHRASE })}
        </label>
        <input
          id="confirm"
          name="confirm"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={error ? "delete-error" : undefined}
          aria-invalid={error === "confirm" ? true : undefined}
          className={`w-full rounded-ctl bg-bg px-3 py-3 font-mono text-[.9rem] outline-none ${error === "confirm" ? "border border-ink ring-2 ring-ink" : "border border-line focus:border-accent focus:ring-[3px] focus:ring-accent-tint"}`}
        />
        {error && (
          <p id="delete-error" role="alert" className="mt-2 text-[.9rem] font-semibold">
            {t(`delete.error.${error}` as MessageKey, { phrase: DELETE_PHRASE })}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="submit">{t("delete.confirm.cta")}</Button>
          <Link href="/account" className="inline-flex items-center rounded-ctl border border-line px-5 py-3 text-[.95rem] font-medium transition-colors hover:bg-surface-2">
            {t("delete.cancel")}
          </Link>
        </div>
      </form>
    </Container>
  );
}