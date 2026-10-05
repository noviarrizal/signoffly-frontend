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
Copy-Item .env.example .env.local    # then fill it in, see below
pnpm dev                             # http://localhost:3000
```

`.env.local` needs the Go API address, the service secret, the signing key and Auth.js settings. Secrets in `.env.local` are never committed.

1. Run the backend with `API_TOKEN_PUBLIC_KEY` and `INTERNAL_SERVICE_SECRET` set (see its README, "User API").
2. Make a key pair in the backend repo: `go run ./cmd/devtoken keygen dev-key.private.pem`. Put the printed public key in the backend's environment. Put the private key in `API_TOKEN_PRIVATE_KEY` here, written on one line with `\n` between lines.
3. `INTERNAL_SERVICE_SECRET` must be the same value in both apps.
4. `AUTH_SECRET`: any long random string.
5. Sign-in: create a GitHub OAuth app (callback `http://localhost:3000/api/auth/callback/github`) and set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`. Without one, set `ALLOW_DEV_LOGIN=true` to get a "Dev sign in" form. It is ignored in production builds.

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
src/app/            routes: / , /signin, /scan/[id], /pricing, /account, /api/*
src/components/     ui (button, tag), report (stamp, score ring, findings), scan (form, runner), pricing
src/lib/api/        token minting, Go client, BFF proxy, error and response types
src/messages/       en.json
src/auth.ts         Auth.js configuration
```

`AGENTS.md` says this version of Next.js has breaking changes and points to the docs in `node_modules/next/dist/docs/`. Read the relevant guide before writing framework code.