import { LocalTime } from "@/components/workspace/local-time";
import type { Me } from "@/lib/api/types";
import { t } from "@/lib/messages";
import { meterBoxes } from "@/lib/workspace";

/** Free scans left today as a row of boxes, like tally marks, with one plain sentence. */
export function QuotaMeter({ me }: { me: Me }) {
  const q = me.quota;
  const { total, used } = meterBoxes(q);
  const sq = me.site_quota;
  return (
    <div className="mt-1 flex flex-col gap-1 text-[.9rem] text-ink-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {total > 0 && (
          <span role="img" aria-label={t("quota.used", { used: q.used, limit: q.limit })} className="inline-flex gap-[.3rem]">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} aria-hidden className={`size-[.7rem] rounded-[3px] border border-ink ${i < used ? "bg-ink" : "bg-transparent"}`} />
            ))}
          </span>
        )}
        <span>
          {q.remaining > 0 ? (
            q.remaining === 1 ? t("quota.left1") : t("quota.left", { n: q.remaining })
          ) : (
            <>
              {t("quota.none")} {q.resets_at ? <LocalTime iso={q.resets_at} format="time" /> : null}
            </>
          )}
        </span>
      </div>
      {sq && sq.remaining === 0 && sq.limit > 0 && (
        <span>
          {t("quota.sitesNone")} {sq.resets_at ? <LocalTime iso={sq.resets_at} format="time" /> : null}
        </span>
      )}
      {sq && sq.remaining > 0 && sq.limit > 0 && <span>{t("quota.sites", { n: sq.remaining, limit: sq.limit })}</span>}
    </div>
  );
}
