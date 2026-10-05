import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { t } from "@/lib/messages";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Checks } from "@/components/marketing/checks";
import { SampleReport } from "@/components/marketing/sample-report";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { Faq } from "@/components/marketing/faq";
import { Closing } from "@/components/marketing/closing";

export default async function Home(props: PageProps<"/">) {
  const session = await auth();
  const sp = await props.searchParams;
  const repo = typeof sp.repo === "string" ? sp.repo.slice(0, 300) : "";

  const deleted = sp.deleted === "1";

  return (
    <>
      {deleted && (
        <div role="status" className="border-b border-line bg-accent-tint">
          <Container className="py-3 text-[.95rem]">{t("deleted.notice")}</Container>
        </div>
      )}
      <Hero signedIn={Boolean(session?.user?.id)} initialRepo={repo} />
      <HowItWorks />
      <Checks />
      <SampleReport />
      <PricingTeaser />
      <Faq />
      <Closing />
    </>
  );
}