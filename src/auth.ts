import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { devLoginEnabled } from "@/lib/env";
import { ApiError } from "@/lib/api/errors";
import { primaryVerifiedEmail } from "@/lib/github-email";
import { syncUser } from "@/lib/users";

/** Sign-in failures the sign-in page knows how to explain. */
export type SignInError = "no_verified_email" | "email_in_use" | "server";

const DEV_HANDLE = /^[a-z0-9-]{3,30}$/i;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/signin", error: "/signin" },
  providers: [
    GitHub({ authorization: { params: { scope: "read:user user:email" } } }),
    ...(devLoginEnabled()
      ? [
          Credentials({
            id: "dev",
            name: "Dev sign in",
            credentials: { handle: { label: "Handle" } },
            async authorize(creds) {
              const handle = String(creds?.handle ?? "").trim().toLowerCase();
              if (!DEV_HANDLE.test(handle)) return null;
              const id = await syncUser({
                provider: "dev",
                providerAccountId: handle,
                email: `${handle}@dev.signoffly.local`,
                emailVerified: true,
                name: handle,
              });
              return { id, name: handle, email: `${handle}@dev.signoffly.local`, goUserId: id };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "github") return true; // the dev provider synced the user in authorize()
      const email = await primaryVerifiedEmail(account.access_token);
      if (!email) return "/signin?error=no_verified_email";
      try {
        user.goUserId = await syncUser({
          provider: "github",
          providerAccountId: account.providerAccountId,
          email,
          emailVerified: true,
          name: user.name,
        });
      } catch (e) {
        return `/signin?error=${e instanceof ApiError && e.code === "email_in_use" ? "email_in_use" : "server"}`;
      }
      return true;
    },
    async jwt({ token, user }) {
      // `user` is only present at the moment of sign-in. The id comes from the Go API, never from the provider.
      if (user?.goUserId) token.userId = user.goUserId;
      return token;
    },
    async session({ session, token }) {
      if (typeof token.userId === "string") session.user.id = token.userId;
      return session;
    },
  },
});