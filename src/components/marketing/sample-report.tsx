import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { ReportView } from "@/components/report/report-view";
import { SectionTitle } from "@/components/marketing/section-title";
import { SAMPLE_REPORT } from "@/lib/sample-report";
import { t } from "@/lib/messages";

export function SampleReport() {
  return (
    <section id="report" className="scroll-mt-20 pb-[clamp(4.5rem,9vw,8rem)]">
      <Container>
        <Reveal>
          <p className="mb-4 font-mono text-[.74rem] font-medium uppercase leading-none tracking-[.14em] text-accent">{t("sample.eyebrow")}</p>
          <SectionTitle before={t("sample.title.before")} emphasis={t("sample.title.emphasis")} after={t("sample.title.after")} />
        </Reveal>
        <Reveal className="mt-10">
          <ReportView report={SAMPLE_REPORT} sample />
        </Reveal>
      </Container>
    </section>
  );
}