# Signoffly frontend

Next.js 16 (App Router), TypeScript, Tailwind CSS v4. The browser talks only to this app; this app's server talks to the Go API (`signoffly-backend`). Design rules are in `docs/design-guide.md`.

## How it fits together

```
Browser  ->  Next.js (pages + /api/* routes)  ->  Go API
```

- **Sign-in:** Auth.js (GitHub, JWT session). On sign-in the server calls the Go API's `POST /internal/users/upsert` with the service secret and keeps the returned user id in the session. The email sent is the primary email GitHub has verified.
- **API calls:** `/api/*` routes (`src/app/api`) are a thin backend-for-frontend. Each one forwards to a fixed Go path through `forwardToApi` (`src/lib/api/proxy.ts`), which reads the user id from the session, signs a 10 minute Ed25519 token (`src/lib/api/token.ts`) and calls Go. The browser never sees the token, the private key or the service secret, and cannot choose who it acts as.
- **Gating:** the Go API removes locked content from free reports before it reaches this app. The UI only shows what it is given.
- **Currency:** prices are listed with the visitor's currency first, from Cloudflare's `CF-IPCountry` header (`ID` shows IDR first, anything else or no header shows USD first), so the checkout selects it by default (`src/lib/currency.ts`). It is only a default: a VPN changes the country, so it never limits what can be bought. The payment method does that (IDR is only payable by Indonesian bank transfer or QRIS).
- **SEO:** `SITE_URL` gives absolute URLs to `robots.txt`, `sitemap.xml` and link previews. The sitemap lists only public pages. Pages that belong to one person (`/scan/[id]`, `/account`, `/history`, `/signin`) are marked `noindex` with `PRIVATE` from `src/lib/site.ts`; add it to any new page of that kind. The preview image (`src/app/opengraph-image.tsx`) and icons are generated from the copy and the brand mark.
- **Sign-in:** GitHub, Google (optional, only offered when both `AUTH_GOOGLE_*` are set) and, locally only, a dev sign-in. A person is trusted only through an email the provider says it has verified (`src/lib/sign-in-email.ts`: GitHub's verified primary email, or Google's `email_verified` claim, which must be the boolean `true`). The API links two sign-ins to one account only when both emails are verified, so the same person with GitHub and Google on one email gets one account, and a stranger with an unverified address gets none.
- **Deploy:** `Dockerfile` makes a small self-contained server (Next.js standalone output, switched on by `NEXT_OUTPUT=standalone`, plain `next build` is unchanged). Nothing secret or site-specific is built in: every setting is read when the container starts. The visitor's address is passed to the API as `X-Client-IP` (`src/lib/api/client-ip.ts`, from the header named in `CLIENT_IP_HEADER`), because every call comes from this server and the API would otherwise limit all visitors together. The full guide is in the backend repository: `docs/deploy.md`.
- **Card payments:** a USD order made with method `lemonsqueezy` comes back with `payment.checkout_url`. The checkout only follows it if `isPaymentPage` (`src/lib/payment-page.ts`) says it is a page on lemonsqueezy.com (https, no credentials, exact host or subdomain), then sends the buyer there; the account page shows a "Pay now" link for unpaid card orders and a thank-you note after `?paid=1`. The pass itself starts when the backend receives the webhook, not when the buyer returns.
- **Website checks:** the scan box takes a GitHub link or a website address (`looksLikeScanTarget` in `src/lib/validation.ts` is a first look, the server decides). A website scan comes back with `kind: "site"`: the report shows the host, only the Security and Legal tabs, a banner that says it is a check from the outside with the notes of what it could not see, and a link to scan the repository. It is never complete, so it is never signed off, and its findings are all shown (there is no pass for a website). The checkout still takes repositories only.
- **Copy:** every UI string lives in `src/messages/en.json` (`t()` in `src/lib/messages.ts`) so translation is a data change. No em or en dashes in copy (a test enforces it).

## Setup

```powershell
pnpm install
pnpm setup:local     # writes .env.local with fresh secrets and prints two lines for the backend
pnpm dev             # http://localhost:3000
```

`pnpm setup:local` makes the signing key, the shared service secret and `AUTH_SECRET`, and turns on a **Dev sign in** form so you can use the app without a GitHub OAuth app. It refuses to overwrite an existing `.env.local` (use `--force` for fresh secrets, then update the backend too). `.env.local` is never committed.

1. Add the two lines it prints (`API_TOKEN_PUBLIC_KEY`, `INTERNAL_SERVICE_SECRET`) to the backend `.env`, then run the backend (`go run ./cmd/server`, default port 8080, which is what `GO_API_URL` points to).
2. Open the app, click Sign in, and use **Dev sign in** with any handle.
3. If sign-in shows "Sign-in is not set up on this server yet", the page lists the settings that are missing. In the terminal, `[auth][error] MissingSecret` means `AUTH_SECRET` is not set, so `.env.local` is missing or the dev server was started before it existed. Restart `pnpm dev` after creating it.
4. Real GitHub sign-in: create a GitHub OAuth app (callback `http://localhost:3000/api/auth/callback/github`) and set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` in `.env.local`. `ALLOW_DEV_LOGIN` is ignored in production builds.
## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build (also type checks) |
| `pnpm lint` | ESLint |
| `pnpm exec tsc --noEmit` | Type check |
| `pnpm exec vitest run` | Unit and component tests |
| `pnpm e2e` | End-to-end browser tests (Playwright) against the real website and API, see `e2e/README.md` |
| `pnpm e2e:network` | The same, plus real scans that call GitHub |
| `pnpm exec next typegen` | Regenerate route types (`PageProps`, `RouteContext`) |

## Layout

```
src/app/            routes: / , /signin, /scan/[id], /history, /pricing, /account, /privacy, /terms, /api/*
src/content/        the Privacy Policy and the Terms as data (see docs/legal-review.md)
src/components/     ui (button, tag), report (stamp, score ring, findings), scan (form, runner), marketing (landing sections), pricing, motion (reveal)
src/lib/api/        token minting, Go client, BFF proxy, error and response types
src/messages/       en.json
src/auth.ts         Auth.js configuration
```

`AGENTS.md` says this version of Next.js has breaking changes and points to the docs in `node_modules/next/dist/docs/`. Read the relevant guide before writing framework code.

## Privacy Policy and Terms

`/privacy` and `/terms` are drafts that describe what the product really does. **They have not been reviewed by a lawyer.** Read `docs/legal-review.md` before launch: it lists the facts the text relies on, the decisions made, and the questions for the lawyer. Set `LEGAL_OPERATOR_NAME` and `LEGAL_CONTACT_EMAIL` in `.env.local` so the pages name who runs the service.