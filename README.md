# Signoffly frontend

Next.js 16 (App Router), TypeScript, Tailwind CSS v4. The browser talks only to this app; this app's server talks to the Go API (`signoffly-backend`). Design rules are in `docs/design-guide.md`.

## How it fits together

```
Browser  ->  Next.js (pages + /api/* routes)  ->  Go API
```

- **Sign-in:** Auth.js (GitHub, JWT session). On sign-in the server calls the Go API's `POST /internal/users/upsert` with the service secret and keeps the returned user id in the session. The email sent is the primary email GitHub has verified.
- **API calls:** `/api/*` routes (`src/app/api`) are a thin backend-for-frontend. Each one forwards to a fixed Go path through `forwardToApi` (`src/lib/api/proxy.ts`), which reads the user id from the session, signs a 10 minute Ed25519 token (`src/lib/api/token.ts`) and calls Go. The browser never sees the token, the private key or the service secret, and cannot choose who it acts as.
- **Gating:** the Go API removes locked content from free reports before it reaches this app. The UI only shows what it is given.
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