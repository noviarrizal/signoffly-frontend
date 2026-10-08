import type { Verdict } from "@/lib/api/types";
import { t } from "@/lib/messages";

const FRAME: Record<Verdict, string> = {
  signed_off: "border-solid border-accent text-accent",
  needs_work: "border-dashed border-ink text-ink",
  blocked: "border-solid border-ink bg-ink text-bg",
};

/** The verdict in the same three shapes as the stamp: solid accent, dashed, filled. Not rotated, so a column of them stays readable. */
export function MiniStamp({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-chip border-2 px-[.55rem] py-[.3rem] font-mono text-[.66rem] font-semibold uppercase leading-none tracking-[.14em] ${FRAME[verdict]}`}>
      {t(`verdict.${verdict}`)}
    </span>
  );
}
