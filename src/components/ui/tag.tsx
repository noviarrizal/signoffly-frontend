import type { Severity } from "@/lib/api/types";
import { t } from "@/lib/messages";

const STYLES: Record<Severity, string> = {
  high: "bg-ink text-bg",
  medium: "border border-ink text-ink",
  low: "bg-low-tint text-low",
};

/** Severity differs by fill, outline and label, never by color alone. */
export function SeverityTag({ severity, count }: { severity: Severity; count?: number }) {
  const label = t(`severity.${severity}`);
  return (
    <span className={`inline-block rounded-chip px-[.6rem] py-[.3rem] font-mono text-[.78rem] leading-none ${STYLES[severity]}`}>
      {count === undefined ? label : `${count} ${label.toLowerCase()}`}
    </span>
  );
}