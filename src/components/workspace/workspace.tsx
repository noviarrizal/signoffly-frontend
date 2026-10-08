import { QuotaMeter } from "@/components/workspace/quota-meter";
import { RepoList } from "@/components/workspace/repo-list";
import { ScanForm } from "@/components/scan/scan-form";
import { Container } from "@/components/ui/container";
import type { Me, RepoSummary } from "@/lib/api/types";
import { t } from "@/lib/messages";

/** What a signed-in person with at least one scan sees on the home page: scan again, then their repositories. */
export function Workspace({ repos, me, initialRepo }: { repos: RepoSummary[]; me: Me | null; initialRepo: string }) {
  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <h1 className="text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-.035em]">{t("workspace.title")}</h1>
      <div id="scan" className="mt-8 max-w-[44rem] scroll-mt-24">
        <ScanForm signedIn initialRepo={initialRepo}>
          {me && <QuotaMeter me={me} />}
        </ScanForm>
      </div>
      <RepoList repos={repos} />
    </Container>
  );
}
