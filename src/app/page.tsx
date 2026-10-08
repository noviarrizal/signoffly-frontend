import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { userFetch } from "@/lib/api/user";
import type { Me, RepoSummary } from "@/lib/api/types";
import { Workspace } from "@/components/workspace/workspace";
import { QuotaMeter } from "@/components/workspace/quota-meter";
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

  // Someone who has scanned before lands on their repositories. If the API cannot be reached, they get the ordinary page.
  const userId = session?.user?.id;
  let repos: RepoSummary[] = [];
  let me: Me | null = null;
  if (userId) {
    [repos, me] = await Promise.all([
      userFetch<{ repos: RepoSummary[] | null }>(userId, "/v1/repos").then((r) => r.repos ?? []).catch(() => []),
      userFetch<Me>(userId, "/v1/me").catch(() => null),
    ]);
  }

  return (
    <>
      {deleted && (
        <div role="status" className="border-b border-line bg-accent-tint">
          <Container className="py-3 text-[.95rem]">{t("deleted.notice")}</Container>
        </div>
      )}
      {repos.length > 0 ? (
        <Workspace repos={repos} me={me} initialRepo={repo} />
      ) : (
        <>
          <Hero signedIn={Boolean(userId)} initialRepo={repo} quota={me ? <QuotaMeter me={me} /> : null} />
          <HowItWorks />
          <Checks />
          <SampleReport />
          <PricingTeaser />
          <Faq />
          <Closing />
        </>
      )}
    </>
  );
}