import Link from "next/link";
import type { Finding } from "@/lib/api/types";
import { SeverityTag } from "@/components/ui/tag";
import { FixPrompt } from "@/components/report/fix-prompt";
import { regionList } from "@/lib/regions";
import { t } from "@/lib/messages";

function where(f: Finding): string | null {
  const e = f.evidence?.[0];
  if (!e?.path) return null;
  return e.line_start ? `${e.path}:${e.line_start}` : e.path;
}

export function FindingRow({ finding: f, repo }: { finding: Finding; repo: string }) {
  const loc = where(f);
  const more = (f.evidence?.length ?? 0) > 1 ? ` (+${f.evidence.length - 1})` : "";
  return (
    <li className="grid gap-3 border-t border-line py-6 first:border-t-0 split:grid-cols-[96px_1fr] split:gap-6">
      <div className="flex items-start">
        <SeverityTag severity={f.severity} />
      </div>
      <div className="min-w-0">
        <h4 className="text-[1.12rem] font-medium leading-[1.35] tracking-[-.015em]">{f.title}</h4>
        {f.blocking && <p className="mt-1 font-mono text-[.74rem] uppercase tracking-[.1em] text-ink">{t("report.blocks")}</p>}
        {f.locked ? (
          <div className="mt-3 rounded-ctl border border-dashed border-line bg-surface p-4">
            <p className="font-medium">{t("report.locked.title")}</p>
            <p className="mt-1 max-w-[58ch] text-[.95rem] text-ink-2">{t("report.locked.body")}</p>
            <Link href={`/pricing?repo=${encodeURIComponent(repo)}`} className="mt-3 inline-block text-[.9rem] font-medium underline underline-offset-4 hover:text-accent">
              {t("report.locked.cta")}
            </Link>
          </div>
        ) : (
          <p className="mt-2 max-w-[68ch] text-ink-2">{f.explanation}</p>
        )}
        {loc && (
          <p className="mt-2 break-all font-mono text-[.8rem] text-ink-3">
            {loc}
            {more}
          </p>
        )}
        {f.category === "legal" && f.regions.length > 0 && !f.locked && (
          <p className="mt-2 text-[.9rem] text-ink-2">
            <span className="font-medium">{t("report.appliesUnder")}:</span> {regionList(f.regions)}
          </p>
        )}
        {f.category === "legal" && f.disclaimer && <p className="mt-1 text-[.85rem] text-ink-3">{f.disclaimer}</p>}
        {!f.locked && f.fix_prompt && <FixPrompt text={f.fix_prompt} />}
      </div>
    </li>
  );
}