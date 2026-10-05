import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="py-[clamp(3rem,8vw,6rem)]">
      <h1 className="text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-.035em]">That page does not exist.</h1>
      <p className="mt-4 text-ink-2">The link may be old or mistyped.</p>
      <ButtonLink href="/" className="mt-8">
        Back to start
      </ButtonLink>
    </Container>
  );
}