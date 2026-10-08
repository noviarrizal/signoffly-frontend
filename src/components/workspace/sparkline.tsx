import { SIGN_OFF_SCORE, sparkDomain, sparkPoints, sparkY } from "@/lib/workspace";

const W = 136;
const H = 40;

/** A small line of the last scores, with the 80 line dashed. The range fits the scores, so only the shape is comparable between rows. Decoration for the eye: the numbers are in the row's text. */
export function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length === 0) return <span aria-hidden className="block" style={{ width: W, height: H }} />;
  const d = sparkDomain(scores);
  const pts = sparkPoints(scores, W, H, d);
  const last = pts[pts.length - 1];
  const gate = sparkY(SIGN_OFF_SCORE, H, d);
  return (
    <svg aria-hidden width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block overflow-visible text-ink-2">
      <line x1={0} x2={W} y1={gate} y2={gate} stroke="var(--line)" strokeWidth={1} strokeDasharray="3 3" />
      {pts.length > 1 && <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />}
      <circle cx={last.x} cy={last.y} r={3.2} fill="var(--accent)" />
    </svg>
  );
}
