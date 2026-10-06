import { LegalDocument } from "@/components/legal/legal-document";
import { termsSections } from "@/content/terms";
import { resolveFacts, reviewedByLawyer } from "@/lib/legal";
import { t } from "@/lib/messages";

export const metadata = { title: "Terms of service", description: t("meta.terms") };

export default function Terms() {
  const { facts, missing } = resolveFacts();
  return <LegalDocument title={t("legal.terms.title")} updated={facts.lastUpdated} sections={termsSections(facts)} reviewed={reviewedByLawyer} missing={missing} />;
}