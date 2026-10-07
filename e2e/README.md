# End-to-end tests

Browser tests that drive the real website and the real Go API together, the way a person does.

```powershell
pnpm e2e              # everything except the scans that call GitHub (about 1 to 2 minutes)
pnpm e2e:network      # also scans a real public repository (about 2 to 3 minutes more)
pnpm e2e:ui           # Playwright's UI mode, to watch and debug
pnpm e2e:report       # open the HTML report of the last run
pnpm exec playwright test account --project=desktop   # one file
```

## What it needs
- **Go** and **pnpm** (already needed for development) and the **backend repository next to this one** (`../signoffly-backend`, or set `E2E_BACKEND_DIR`).
- **A browser:** on Windows the tests use the installed Microsoft Edge, so nothing is downloaded. On other systems run `pnpm exec playwright install chromium` once.
- **A database.** The backend uses its own `.env` (your Neon database) unless you give the tests their own, see below.
- The scan tests also need internet access to GitHub.

## What it starts by itself
Two servers on their own ports, so your `pnpm dev` and your backend are never touched:
- the Go API on `19090` (built to `.e2e/server`), started with throwaway secrets,
- the website on `3200`, in its own build folder `.next-e2e`.

Throwaway secrets (a signing key, the service secret, the Auth.js secret) are created once in the git-ignored `.e2e` folder. GitHub sign-in is switched off and the development sign-in form is used instead, so no OAuth app is needed.

## Test data
Every test that needs an account creates a new one with a unique handle and removes it again when it ends, even if it fails (`e2e/fixtures.ts`). If a run is killed half way, an account called `e2e-...` may be left in the database. Delete it with the internal endpoint or in the Neon console.

## A separate database (recommended, optional)
Neon can copy your database into a branch in seconds. Tests that run on a branch can never touch real data.
1. In the Neon console open the project, go to **Branches**, create a branch (for example `e2e`) from your main branch.
2. Copy its two connection strings (pooled and direct).
3. Create `.env.e2e` in this folder (it is git-ignored):
   ```
   E2E_DATABASE_URL=<pooled connection string of the branch>
   E2E_DATABASE_URL_DIRECT=<direct connection string of the branch>
   ```
A branch copies the tables, so no migration is needed. After a new migration, run it on the branch as well.

## Files
```
e2e/smoke.spec.ts      public pages, theme, sample report, pricing, legal pages, redirects, API 401
e2e/account.spec.ts    sign in and out, quota, the data export download, deleting the account
e2e/billing.spec.ts    ordering and approving a project pass
e2e/mobile.spec.ts     phone size: no sideways scroll, the menu
e2e/a11y.spec.ts       automated accessibility checks (axe), light and dark
e2e/scan.spec.ts       real scan, locked and unlocked report (pnpm e2e:network)
e2e/site.spec.ts       addresses that point inward are refused by the whole stack; a real website check (pnpm e2e:network)
e2e/fixtures.ts        sign in helper, account fixture, owner actions
e2e/support/           test servers' settings and secrets
```