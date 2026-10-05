import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { auth, signIn } from "@/auth";
import { devLoginEnabled } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { t, type MessageKey } from "@/lib/messages";

export const metadata = { title: "Sign in" };

/** Only a path on this site, carrying at most the pasted repository, is ever used after sign-in. */
function destination(repo: string): string {
  return repo ? `/?repo=${encodeURIComponent(repo)}` : "/";
}

export default async function SignIn(props: PageProps<"/signin">) {
  const sp = await props.searchParams;
  const repo = typeof sp.repo === "string" ? sp.repo.slice(0, 300) : "";
  const error = typeof sp.error === "string" ? sp.error : "";
  if ((await auth())?.user?.id) redirect(destination(repo));

  const known = ["no_verified_email", "email_in_use", "server"];
  const message = error ? t((known.includes(error) ? `signin.error.${error}` : "signin.error.default") as MessageKey) : "";

  async function github() {
    "use server";
    await signIn("github", { redirectTo: destination(repo) });
  }
  async function dev(form: FormData) {
    "use server";
    try {
      await signIn("dev", { handle: String(form.get("handle") ?? ""), redirectTo: destination(repo) });
    } catch (e) {
      if (e instanceof AuthError) redirect(`/signin?error=server${repo ? `&repo=${encodeURIComponent(repo)}` : ""}`);
      throw e; // a successful sign-in redirects by throwing
    }
  }

  return (
    <Container className="py-[clamp(3rem,8vw,6rem)]">
      <div className="max-w-[26rem]">
        <h1 className="text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-.035em]">{t("signin.title")}</h1>
        <p className="mt-4 text-ink-2">{t("signin.sub")}</p>
        {message && (
          <p role="alert" className="mt-6 text-[.95rem] font-semibold">
            {message}
          </p>
        )}
        <form action={github} className="mt-8">
          <Button type="submit" className="w-full">
            <GithubLogo aria-hidden size={18} /> {t("signin.github")}
          </Button>
        </form>
        {devLoginEnabled() && (
          <form action={dev} className="mt-10 border-t border-line pt-6">
            <label htmlFor="handle" className="mb-2 block text-[.9rem] font-medium">
              {t("signin.devHandle")}
            </label>
            <input id="handle" name="handle" required minLength={3} maxLength={30} pattern="[A-Za-z0-9\-]+" autoComplete="off" className="w-full rounded-ctl border border-line bg-bg px-3 py-3 font-mono text-[.9rem] outline-none focus:border-accent focus:ring-[3px] focus:ring-accent-tint" />
            <Button type="submit" variant="ghost" className="mt-3 w-full">
              {t("signin.dev")}
            </Button>
          </form>
        )}
      </div>
    </Container>
  );
}