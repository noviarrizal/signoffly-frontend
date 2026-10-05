"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { t } from "@/lib/messages";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container className="py-[clamp(3rem,8vw,6rem)]">
      <h1 className="text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-.035em]">{t("error.generic")}</h1>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </Container>
  );
}