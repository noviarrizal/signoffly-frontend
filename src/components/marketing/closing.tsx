import { auth } from "@/auth";
import { ScanForm } from "@/components/scan/scan-form";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { t } from "@/lib/messages";

export async function Closing() {
  const signedIn = Boolean((await auth())?.user?.id);
  return (
    <section className="pb-[clamp(4.5rem,9vw,8rem)]">
      <Container className="grid grid-cols-12 items-end gap-x-6 gap-y-8">
        <Reveal className="col-span-12 split:col-span-6">
          <h2 className="text-[clamp(2.4rem,5.4vw,4.6rem)] font-medium leading-[1.1] tracking-[-.035em]">
            {t("closing.title.before")} <em className="inline-block pb-[.06em] font-normal italic">{t("closing.title.emphasis")}</em>
          </h2>
        </Reveal>
        <Reveal delay={100} className="col-span-12 split:col-start-8 split:col-end-[-1]">
          <ScanForm signedIn={signedIn} />
        </Reveal>
      </Container>
    </section>
  );
}