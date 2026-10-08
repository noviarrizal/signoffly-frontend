import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { devLoginEnabled, githubConfigured, googleConfigured } from "@/lib/env";
import { ApiError } from "@/lib/api/errors";
import { isOAuthProvider, verifiedEmailFor, type ProfileClaims } from "@/lib/sign-in-email";
import { syncUser } from "@/lib/users";

/** Sign-in failures the sign-in page knows how to explain. */
export type SignInError = "no_verified_email" | "email_in_use" | "server";

const DEV_HANDLE = /^[a-z0-9-]{3,30}$/i;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/signin", error: "/signin" },
  providers: [
    ...(githubConfigured() ? [GitHub({ authorization: { params: { scope: "read:user user:email" } } })] : []),
    // Only the basic profile and email are asked for. The account chooser is always shown, so a person with several Google
    // accounts picks one on purpose instead of being signed in with whichever one the browser is using.
    ...(googleConfigured() ? [Google({ authorization: { params: { scope: "openid email profile", prompt: "select_account" } } })] : []),
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
    async signIn({ user, account, profile }) {
      if (!account || !isOAuthProvider(account.provider)) return true; // the dev provider synced the user in authorize()
      const email = await verifiedEmailFor(account.provider, account, profile as ProfileClaims | undefined);
      if (!email) return "/signin?error=no_verified_email";
      try {
        user.goUserId = await syncUser({
          provider: account.provider,
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