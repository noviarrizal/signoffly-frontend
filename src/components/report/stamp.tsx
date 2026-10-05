import type { Verdict } from "@/lib/api/types";
import { t } from "@/lib/messages";

const FRAME: Record<Verdict, string> = {
  signed_off: "border-2 border-solid border-accent text-accent",
  needs_work: "border-2 border-dashed border-ink text-ink",
  blocked: "border-2 border-solid border-ink bg-ink text-bg",
};

const INNER: Record<Verdict, string> = {
  signed_off: "border-accent",
  needs_work: "border-ink",
  blocked: "border-bg",
};

/** The signature element. Used for verdicts only (design guide, section 5.4). */
export function Stamp({ verdict, subtitle, animate = false }: { verdict: Verdict; subtitle?: string; animate?: boolean }) {
  return (
    <div
      role="img"
      aria-label={`Verdict: ${t(`verdict.${verdict}`)}`}
      className={`relative inline-flex -rotate-[7deg] flex-col items-center rounded-ctl px-5 py-[.8rem] font-mono font-semibold uppercase tracking-[.2em] ${FRAME[verdict]} ${animate ? "stamp-land" : ""}`}
    >
      <span aria-hidden className={`pointer-events-none absolute inset-[3px] rounded-[6px] border opacity-50 ${INNER[verdict]}`} />
      <span className="text-[.82rem] leading-none">{t(`verdict.${verdict}`)}</span>
      <span className="mt-[.45rem] text-[.6rem] font-normal leading-none opacity-80">{subtitle ?? t("stamp.by")}</span>
    </div>
  );
}