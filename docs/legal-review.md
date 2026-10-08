# Legal review pack: Privacy Policy and Terms of Service

Status (2026-10-05): **drafts written by an AI assistant from public guidance. Not reviewed by a lawyer. Not legal advice.** Do not charge users or open signups until a qualified lawyer has read both documents and this page. When that has happened, set `reviewedByLawyer = true` in `src/lib/legal.ts` (it removes the "Draft" notice from both pages) and update `lastUpdated`.

Where the text lives: `src/content/privacy.ts` and `src/content/terms.ts` (plain data, easy to edit). Facts the text states are in `src/lib/legal.ts`. Tests in `src/content/legal.test.ts` keep the text honest (no dashes, no compliance claims, numbers match the product).

## What the documents say about the product (verify before launch)

| Statement in the text | True today because | Must change when |
|---|---|---|
| We store email, name, GitHub account id | `users` and `user_identities` tables (backend migration 00001) | a new sign-in method is added |
| We store scan results: repository, branch, commit, regions, score, verdict, findings with file paths, lines and masked excerpts | `scans`, `findings` tables; analyzers mask secrets (backend `internal/findings`) | anything else is stored |
| A temporary copy of the repository is downloaded, read as text and deleted | backend `internal/gitclone`, stage `cleanup` | scans start to keep copies |
| We never run your code | analyzers read files only | analysis ever executes code |
| Orders store repository, currency, amount, reference, status, dates | `orders`, `entitlements` tables | a card provider is added (then list it, see below) |
| Unsupported links are counted anonymously, the link is not stored | `input_signals` (counts by kind and platform) | the link is ever stored |
| No analytics or advertising trackers; only a session cookie, a security cookie, a redirect cookie and a theme choice in the browser | Auth.js with JWT sessions; no analytics scripts | any analytics, pixel or chat widget is added |
| A website check opens the home page and the script files it loads from the same address, over https and http, from our server; only the host name, the findings and masked excerpts are kept, not the pages | backend `internal/safeweb` and `internal/analyzers/web`; stored as owner `~site`, name = host | a check starts to sign in, submit forms, probe for files (.env, .git) or keep page contents |
| No code or data is sent to an AI provider | `LLM_ENABLED=false`, milestone M6 not built | **M6 ships: name the provider, what is sent and where it is processed before enabling** (backend spec section 9.3 says DeepSeek processes data in China, unverified) |
| Sign-in is through GitHub, and through Google when it is switched on (`AUTH_GOOGLE_*`); Google is listed in `processors` with `active: false` until then | `src/auth.ts` | Google is switched on: set it to `active: true` in `src/lib/legal.ts` in the same release |
| Providers listed: GitHub, Neon (Singapore) | sign-in and database | add each provider the day it is used: hosting provider, Lemon Squeezy (`active: true` in `src/lib/legal.ts`) |
| Retention: until the account is deleted | decided 2026-10-05 | an automatic deletion job is built (then state the period) |
| Users can download their data and delete their account on the account page | backend `GET /v1/me/export` and `DELETE /v1/me` (the delete needs a typed confirmation, and one `DELETE` removes the account, scans, findings, orders and passes through foreign keys) | the data model gains a table that is not removed with the user |
| Payment records kept outside the app (bank records, the owner's accounting) outlive the account | the orders table is deleted with the account, so the owner must keep their own bookkeeping | order records must be kept inside the app (then change the delete to keep them, and say so) |
| Free limit 3 scans per 24 hours, pass 14 days, refund 7 days | backend `FREE_SCANS_PER_DAY`, `PASS_DAYS`; refund decided 2026-10-05 | any of these change (they live in `BASE_FACTS`) |
| Governing law: Republic of Indonesia | decided 2026-10-05 | the lawyer advises otherwise |

Not yet defined and therefore **not promised** in the text: how long server logs and backups are kept, and a response time for data requests (the text says "within the time the law requires").

## Decisions made by the owner (2026-10-05)
1. Retention: reports and account data are kept until the user deletes the account.
2. Refunds: within 7 days of paying, if no scan has used the pass.
3. Governing law: Republic of Indonesia.

The operator name and contact email come from `LEGAL_OPERATOR_NAME` and `LEGAL_CONTACT_EMAIL`. Until both are set, the pages show a visible placeholder.

## Questions for the lawyer
Items marked (unverified) come from secondary sources and must be checked.

1. **Indonesia, language:** does an agreement with an Indonesian party need an Indonesian-language version (Law 24 of 2009, article 31)? (unverified)
2. **Indonesia, registration:** must a private electronic system operator such as this service register with the communications ministry? (unverified)
3. **UU PDP:** is the lawful-basis wording right? Is a data protection officer needed at this size? Are there fixed response times for data subject requests (secondary sources mention 3x24 hours for some requests)? How should the 3x24 hour breach notification be handled in practice?
4. **GDPR:** is an EU representative needed (Article 27) if EU users are served without an EU establishment? Are the legitimate-interest statements acceptable? What transfer mechanism is needed for providers outside the EU?
5. **Providers:** do GitHub and Neon terms act as data processing agreements, and do we need to sign anything else?
6. **Terms:** is the liability cap (amount paid in the last 12 months, zero if nothing was paid) enforceable, including against consumers? Is a refund policy of 7 days acceptable under consumer protection law where buyers live?
7. **Age:** is 18 right (UU PDP rules on children, GDPR digital consent age differs by country)?
8. **Deleting order records:** when a user deletes their account, their orders are deleted too, while accounting and tax rules may require records of sales to be kept. Is it enough that the owner keeps bank records and a bookkeeping file outside the app, or must the app keep the order data (and the Privacy Policy say so)?
9. **Tax:** VAT or sales tax on digital services for Indonesian and foreign buyers, and what a receipt must show. (outside the scope of these documents, but the Terms say prices include or exclude taxes "as shown at checkout")
10. **Disputes:** courts or arbitration, and which court.
11. **Website checks:** is it acceptable for our server to request the public home page and script files of a website that the person may not own, when we only read what any visitor receives, identify ourselves in the User-Agent, and limit how often one site is checked? Should the Terms require the person to own the site or have permission? Is a check for exposed files such as .env or .git acceptable only after the person proves they control the domain (planned, not built)?
12. **Legal findings in the product:** the wording of `legalText` in the backend (`internal/findings/catalog.go`) and section 8 of the backend spec are also unreviewed.

## Sources used for the structure
- GDPR Articles 12 to 14 checklists: https://gdpr-text.com/read/article-13/ , https://www.dataprotection.ie/en/individuals/know-your-rights/right-be-informed-transparency-article-13-14-gdpr
- Indonesia UU PDP overviews: https://www.linklaters.com/en/insights/data-protected/data-protected---indonesia , https://www.dlapiperdataprotection.com/?t=law&c=ID
- SaaS terms structure: https://www.termsfeed.com/blog/sample-saas-terms-conditions-template/ , https://termly.io/resources/templates/terms-of-service-template/
These are secondary guides, not the laws themselves.