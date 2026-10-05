import { LegalDocument } from "@/components/legal/legal-document";
import { privacySections } from "@/content/privacy";
import { resolveFacts, reviewedByLawyer } from "@/lib/legal";
import { t } from "@/lib/messages";

export const metadata = { title: "Privacy policy" };

export default function Privacy() {
  const { facts, missing } = resolveFacts();
  return <LegalDocument title={t("legal.privacy.title")} updated={facts.lastUpdated} sections={privacySections(facts)} reviewed={reviewedByLawyer} missing={missing} />;
}