"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import type { Catalog, Order } from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import { bff } from "@/components/scan/api";
import { Spinner } from "@/components/ui/button";
import { looksLikeRepoUrl } from "@/lib/validation";
import { isPaymentPage } from "@/lib/payment-page";
import { t, type MessageKey } from "@/lib/messages";

/** `navigate` is only replaced in tests. */
const goTo = (url: string) => window.location.assign(url);

export function Checkout({ catalog, signedIn, initialRepo, navigate = goTo }: { catalog: Catalog; signedIn: boolean; initialRepo: string; navigate?: (url: string) => void }) {
  const id = useId();
  const [repo, setRepo] = useState(initialRepo);
  const [option, setOption] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const payUrl = order && isPaymentPage(order.payment.checkout_url) ? order.payment.checkout_url : null;

  // A card order goes straight to the payment page. The button below stays for anyone who is not taken there.
  useEffect(() => {
    if (payUrl) navigate(payUrl);
  }, [payUrl, navigate]);

  if (catalog.options.length === 0) return <p className="text-ink-2">{t("pricing.closed")}</p>;
  const chosen = catalog.options[option];

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!looksLikeRepoUrl(repo)) {
      setError(t("checkout.invalid"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const o = await bff<Order>("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repo.trim(), currency: chosen.currency, method: chosen.methods[0] }),
      });
      if (o.payment.method === "lemonsqueezy" && !isPaymentPage(o.payment.checkout_url)) {
        setError(t("error.generic")); // a card order without a real payment page cannot be paid, so it is not shown as an order
        return;
      }
      setOrder(o);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error.generic"));
    } finally {
      setBusy(false);
    }
  }

  if (order && payUrl) {
    return (
      <div role="status" className="rounded-ctl border border-bg/30 p-5">
        <p className="font-medium">{t("checkout.order")}</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[.95rem]">
          <dt className="opacity-70">{t("checkout.amount")}</dt>
          <dd className="font-mono">{order.payment.display}</dd>
        </dl>
        <p className="mt-4 text-[.9rem] opacity-80">{t("checkout.redirecting")}</p>
        <a href={payUrl} className="mt-4 inline-flex whitespace-nowrap rounded-ctl bg-bg px-5 py-3 font-medium text-ink transition-colors hover:bg-accent hover:text-accent-ink">
          {t("checkout.pay")}
        </a>
        <p className="mt-4 text-[.85rem] opacity-70">{t("checkout.after.card")}</p>
      </div>
    );
  }

  if (order) {
    return (
      <div role="status" className="rounded-ctl border border-bg/30 p-5">
        <p className="font-medium">{t("checkout.order")}</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[.95rem]">
          <dt className="opacity-70">{t("checkout.reference")}</dt>
          <dd className="font-mono">{order.payment.reference}</dd>
          <dt className="opacity-70">{t("checkout.amount")}</dt>
          <dd className="font-mono">{order.payment.display}</dd>
        </dl>
        {order.payment.instructions && <p className="mt-4 whitespace-pre-line text-[.95rem]">{order.payment.instructions}</p>}
        <p className="mt-4 text-[.9rem] opacity-80">{t("checkout.after")}</p>
        <Link href="/account" className="mt-4 inline-block text-[.9rem] underline underline-offset-4">
          {t("nav.account")}
        </Link>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <Link href={`/signin?repo=${encodeURIComponent(repo)}`} className="inline-flex whitespace-nowrap rounded-ctl bg-bg px-5 py-3 font-medium text-ink transition-colors hover:bg-accent hover:text-accent-ink">
        {t("checkout.signin")}
      </Link>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor={id} className="mb-2 block text-[.9rem] font-medium">
          {t("checkout.repo")}
        </label>
        <input
          id={id}
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder={t("repo.placeholder")}
          aria-invalid={error ? true : undefined}
          className="w-full rounded-ctl border border-bg/30 bg-transparent px-3 py-3 font-mono text-[.9rem] outline-none placeholder:opacity-50 focus:border-bg"
        />
      </div>
      {catalog.options.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-[.9rem] font-medium">{t("checkout.currency")}</legend>
          <div className="flex flex-wrap gap-2">
            {catalog.options.map((o, i) => (
              <button
                key={o.currency}
                type="button"
                aria-pressed={i === option}
                onClick={() => setOption(i)}
                className={`rounded-chip border px-3 py-2 text-[.9rem] ${i === option ? "border-bg bg-bg text-ink" : "border-bg/30"}`}
              >
                {o.currency} {o.display}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <p className="text-[.9rem] opacity-80">
        {chosen.display} · {t(`checkout.method.${chosen.methods[0]}` as MessageKey)}
      </p>
      {error && (
        <p role="alert" className="text-[.9rem] font-semibold">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-ctl bg-bg px-5 py-3 font-medium text-ink transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-60"
      >
        {busy && <Spinner />}
        {t("checkout.start")}
      </button>
    </form>
  );
}