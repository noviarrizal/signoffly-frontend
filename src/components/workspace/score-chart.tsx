import { LocalTime } from "@/components/workspace/local-time";
import { t } from "@/lib/messages";
import { SIGN_OFF_SCORE, sparkPoints, sparkY, type Domain } from "@/lib/workspace";

export interface ChartScan {
  score: number;
  verdict: string;
  created_at: string;
}

const W = 640;
const H = 220;
const PAD = 14;
const FULL: Domain = { lo: 0, hi: 100 };
const top = (score: number) => `${(sparkY(score, H, FULL, PAD) / H) * 100}%`;

/**
 * The score of each finished scan, oldest on the left, on a fixed 0 to 100 scale with the sign-off line dashed.
 * A scan that was signed off gets a ring. The table under it on the page is the exact list for anyone who cannot see the chart.
 */
export function ScoreChart({ scans }: { scans: ChartScan[] }) {
  const pts = sparkPoints(
    scans.map((s) => s.score),
    W,
    H,
    FULL,
    PAD,
  );
  const gate = sparkY(SIGN_OFF_SCORE, H, FULL, PAD);
  const first = scans[0];
  const last = scans[scans.length - 1];
  return (
    <figure>
      <div className="grid grid-cols-[2.2rem_1fr] gap-x-3">
        <div aria-hidden className="relative font-mono text-[.72rem] text-ink-3">
          {[100, SIGN_OFF_SCORE, 0].map((v) => (
            <span key={v} className={`absolute right-0 -translate-y-1/2 ${v === SIGN_OFF_SCORE ? "text-ink" : ""}`} style={{ top: top(v) }}>
              {v}
            </span>
          ))}
        </div>
        <svg role="img" aria-label={t("repo.chart.label", { from: first.score, to: last.score, n: scans.length })} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible">
          {[100, 0].map((v) => (
            <line key={v} x1={0} x2={W} y1={sparkY(v, H, FULL, PAD)} y2={sparkY(v, H, FULL, PAD)} stroke="var(--line)" strokeWidth={1} />
          ))}
          <line x1={0} x2={W} y1={gate} y2={gate} stroke="var(--ink-3)" strokeWidth={1} strokeDasharray="5 5" />
          <polyline className="draw-line" pathLength={1} points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => {
            const isLast = i === pts.length - 1;
            const signed = scans[i].verdict === "signed_off";
            return (
              <g key={i}>
                {signed && <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="var(--accent)" strokeWidth={2} />}
                <circle cx={p.x} cy={p.y} r={isLast ? 5.5 : 4} fill={isLast || signed ? "var(--accent)" : "var(--bg)"} stroke={isLast || signed ? "var(--accent)" : "var(--ink)"} strokeWidth={2} />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-[2.2rem_1fr] gap-x-3 text-[.82rem] text-ink-3">
        <span />
        <span className="flex justify-between">
          <LocalTime iso={first.created_at} format="date" />
          <LocalTime iso={last.created_at} format="date" />
        </span>
      </div>
      <figcaption className="mt-3 text-[.86rem] text-ink-3">{t("repo.chart.gate", { score: SIGN_OFF_SCORE })}</figcaption>
    </figure>
  );
}
