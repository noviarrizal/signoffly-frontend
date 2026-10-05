"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/messages";

/** The fix prompt is a core differentiator, so every unlocked finding shows one. */
export function FixPrompt({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access can be blocked; fall back to selecting a hidden field.
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } finally {
        el.remove();
      }
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mt-4 overflow-hidden rounded-ctl border border-line bg-bg">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <span className="font-mono text-[.74rem] uppercase tracking-[.1em] text-ink-3">{t("report.fixLabel")}</span>
        <button
          type="button"
          onClick={copy}
          className={`whitespace-nowrap rounded-chip border px-3 py-1.5 text-[.82rem] transition-colors ${copied ? "border-accent bg-accent text-accent-ink" : "border-line hover:bg-surface-2"}`}
        >
          <span aria-live="polite">{copied ? t("report.copied") : t("report.copy")}</span>
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words px-3 py-3 font-mono text-[.8rem] leading-[1.65] text-ink-2">{text}</pre>
    </div>
  );
}