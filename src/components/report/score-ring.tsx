import type { Verdict } from "@/lib/api/types";
import { t } from "@/lib/messages";

/** 132px conic ring (design guide, section 5.5). */
export function ScoreRing({ score, verdict }: { score: number; verdict: Verdict }) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const color = verdict === "signed_off" ? "var(--accent)" : "var(--ink)";
  return (
    <div
      role="img"
      aria-label={`Score ${value} out of 100`}
      className="relative grid size-[132px] shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${color} ${value * 3.6}deg, var(--surface-2) 0)` }}
    >
      <div className="absolute inset-[11px] rounded-full bg-surface" />
      <div className="relative text-center leading-none">
        <div className="text-[2.4rem] font-medium">{value}</div>
        <div className="mt-1 text-[.72rem] text-ink-3">{t("report.score")}</div>
      </div>
    </div>
  );
}