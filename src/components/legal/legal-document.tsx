import type { ReactNode } from "react";
import type { Block, Section } from "@/content/legal-types";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/marketing/section-title";
import { t } from "@/lib/messages";

function BlockView({ block }: { block: Block }): ReactNode {
  if (typeof block === "string") return <p className="max-w-[68ch] text-ink-2">{block}</p>;
  if ("list" in block) {
    return (
      <ul className="max-w-[68ch] list-disc space-y-2 pl-5 text-ink-2">
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  const { head, rows } = block.table;
  return (
    <div className="overflow-x-auto rounded-ctl border border-line">
      <table className="w-full min-w-[34rem] border-collapse text-left text-[.92rem]">
        <thead className="bg-surface-2">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-line align-top">
              {row.map((cell, i) => (
                <td key={i} className={`px-4 py-3 ${i === 0 ? "font-medium" : "text-ink-2"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalDocument({ title, updated, sections, reviewed, missing }: { title: string; updated: string; sections: Section[]; reviewed: boolean; missing: string[] }) {
  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <SectionTitle as="h1" before={title} />
      <p className="mt-3 text-[.9rem] text-ink-3">
        {t("legal.updated")}: {updated}
      </p>

      {!reviewed && (
        <div role="note" className="mt-8 max-w-[68ch] rounded-ctl border border-dashed border-line bg-surface p-4">
          <p className="font-medium">{t("legal.draft.title")}</p>
          <p className="mt-1 text-[.92rem] text-ink-2">{t("legal.draft.body")}</p>
        </div>
      )}
      {missing.length > 0 && process.env.NODE_ENV !== "production" && (
        <div role="note" className="mt-4 max-w-[68ch] rounded-ctl border border-dashed border-line p-4">
          <p className="font-medium">{t("legal.missing.title")}</p>
          <p className="mt-1 text-[.92rem] text-ink-2">{t("legal.missing.body")}</p>
          <ul className="mt-2 list-disc pl-5 font-mono text-[.8rem]">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-10">
        <nav aria-label={t("legal.contents")} className="col-span-12 split:col-span-3">
          <div className="split:sticky split:top-24">
            <p className="font-mono text-[.74rem] uppercase tracking-[.14em] text-ink-3">{t("legal.contents")}</p>
            <ol className="mt-3 space-y-2 text-[.92rem]">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-ink-2 transition-colors hover:text-accent">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <div className="col-span-12 space-y-12 split:col-span-8 split:col-start-5">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-[1.5rem] font-medium leading-[1.2] tracking-[-.025em]">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-4 space-y-4">
                {s.blocks.map((b, j) => (
                  <BlockView key={j} block={b} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}