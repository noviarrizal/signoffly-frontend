import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ScanRunner } from "@/components/scan/scan-runner";
import { Container } from "@/components/ui/container";
import { isUuid } from "@/lib/validation";
import { PRIVATE } from "@/lib/site";

export const metadata = { title: "Your report", ...PRIVATE };

export default async function ScanPage(props: PageProps<"/scan/[id]">) {
  const { id } = await props.params;
  if (!isUuid(id)) notFound();
  if (!(await auth())?.user?.id) redirect("/signin");
  return (
    <Container className="py-[clamp(2rem,5vw,4rem)]">
      <ScanRunner id={id} />
    </Container>
  );
}