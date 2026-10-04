# Signoffly Design Guide

Status: v1, approved direction (2026-10-04).
Reference mock: `D:\research-web-design\signoffly-design-v1.html` (open it in a browser to see everything below working). Where this guide and the mock disagree, this guide wins.

Stack this guide is written for: Next.js, TypeScript, Tailwind CSS v4, shadcn/ui (customized, never default), Motion (`motion/react`), Phosphor icons.

---

## 1. What the product should feel like

Signoffly tells non-technical builders whether their app is ready to ship. The design has one job: make a worrying result feel calm, clear and trustworthy.

- **Calm, not corporate.** White space, quiet type, one accent. No dashboards-in-the-hero, no neon, no "AI purple".
- **The report is the product.** Landing page and app exist to lead to the report. Design the report first, everything else follows.
- **The stamp is the signature.** A sign-off stamp is the one memorable visual. Use it for verdicts, never as decoration.
- **Plain words.** Every finding is written for someone who does not read code. See section 9.
- **Fun lives in small moments only.** Loading copy, the stamp landing, friendly errors. No mascots, no emoji.

Design dials (reference for decisions): variance 6, motion 4, density 3.

---

## 2. Color

One neutral scale, one accent. No other hues exist in the product.

### Tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#0E0E0E` | Page background, input background |
| `--surface` | `#FAFAF9` | `#171717` | Cards, report container |
| `--surface-2` | `#F0F0EE` | `#222222` | Nav capsule, region bar, hover fills |
| `--ink` | `#121212` | `#F2F2F0` | Primary text, primary button, high severity |
| `--ink-2` | `#4A4A47` | `#B2B2AE` | Secondary text, body copy |
| `--ink-3` | `#65655F` | `#8F8F8B` | Tertiary text, file paths, captions |
| `--line` | `#E2E2DE` | `#2C2C2C` | Hairlines and borders (1px) |
| `--accent` | `#2338D6` | `#93A0FF` | "Stamp-ink blue". Approval and focus |
| `--accent-ink` | `#FFFFFF` | `#0E0E0E` | Text on solid accent |
| `--accent-tint` | `#E6EAFD` | `#1A2040` | Soft accent fills (legal card, focus halo) |
| `--low` / `--low-tint` | `#4A4A47` / `#E6E6E3` | `#B2B2AE` / `#262626` | Low severity tag |

Light is the default theme. Dark is opt-in through a toggle (see section 11). Never follow the OS theme automatically.

### Rules

1. **White dominates.** Most of any screen is `--bg`. Tinted or dark surfaces are rare accents, not backgrounds for whole sections.
2. **The accent means "good" or "interactive".** Allowed: signed-off stamp, brand icon, italic emphasis word in headlines, step and feature icons, active tab underline, focus ring, link hover, checkmarks, `signed off` badge, the one soft tinted card (Legal).
3. **The accent never means "problem".** Problems are shown in monochrome (section 5.3). Do not introduce red, amber or green anywhere.
4. **No pure black text.** Text is `--ink`. Pure `#000` is not used.
5. **Never convey meaning by color alone.** Status always also differs in shape, fill or label.
6. **One dark tile per page at most** in light mode (the Testing tile in the mock is the example). It is a deliberate contrast point, not a pattern to repeat.
7. Contrast must meet WCAG AA: 4.5:1 for body text, 3:1 for large text and UI. The accent on white is about 8:1.

### Open question
If a future need arises for a warning color (for example, destructive confirmations), add it as a single documented token. Do not reuse the accent for it.

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Display and text | **Instrument Sans** | Weights 400, 500, 600 plus italic 400 and 500 |
| Code, labels, stamp, file paths | **Geist Mono** | Weights 400, 500, 600 |

Load both with `next/font/google`. Never use a `<link>` tag to Google Fonts in production. Do not use Inter. Do not use a serif.

### Scale

| Element | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| Hero H1 | `clamp(2.6rem, 6.4vw, 5.6rem)` | 500 | 1.1 | -0.045em |
| Closing H2 | `clamp(2.4rem, 5.4vw, 4.6rem)` | 500 | 1.1 | -0.035em |
| Section H2 | `clamp(2rem, 4.2vw, 3.4rem)` | 500 | 1.1 | -0.035em |
| Card H3 | 1.5rem | 500 | 1.15 | -0.025em |
| Verdict H3 | 1.6rem | 500 | 1.2 | -0.03em |
| Finding title (H4) | 1.12rem | 500 | 1.35 | -0.015em |
| Body | 1rem | 400 | 1.6 | 0 |
| Lede | 1rem, `--ink-2`, max 60ch | 400 | 1.6 | 0 |
| Hero subtext | 1.15rem, `--ink-2`, max 34ch | 400 | 1.5 | 0 |
| Mono label (eyebrow) | 0.74rem, uppercase | 500 | 1 | 0.14em |
| Mono code and paths | 0.8 to 0.9rem | 400 | 1.65 | 0 |

### Headline emphasis
Emphasize one word or phrase per headline using **italic of the same font** (never a second typeface). In the hero it takes the accent color. In section headlines it stays `--ink`.
Italic words containing descenders (`y g j p q`) need `line-height` of at least 1.1 and `padding-bottom: .08em` on an `inline-block` wrapper, or the descender clips.

### Rules
- Body copy max width 65ch. Cards and FAQ answers cap lower (42 to 58ch).
- Eyebrows (small uppercase mono labels above headlines): at most **one per three sections** across a page. The hero never has one. Default to no eyebrow.
- Sentence case everywhere. Uppercase is reserved for the stamp and the rare eyebrow.

---

## 4. Layout, spacing, shape

### Grid and containers
- Content container: `width: min(1240px, 100% - 48px)`, centered. Under 640px the gutter is 16px per side.
- 12-column grid, 24px column gap. Marketing sections use asymmetric spans (5 and 7, 4 and 8) instead of equal thirds.
- Desktop to stacked switch happens at **900px**, not Tailwind's default. In Tailwind v4 add `--breakpoint-split: 900px` and use `split:` prefixes for the two-column layouts. The report summary stacks at 700px.

### Vertical rhythm
- Section padding: `clamp(4.5rem, 9vw, 8rem)` top and bottom. Consecutive sections after the hero drop the top padding so spacing does not double.
- Nav: 64px tall, sticky, 1px bottom border. It must stay on one line at desktop.
- Hero: top padding `clamp(2.5rem, 6vw, 5rem)`, must fit headline, subtext and the form in the first viewport at 1440x900.

### Hero rules
Maximum four text elements: headline (two lines max), subtext (20 words max), form, and one secondary link. No tagline under the buttons, no trust strip, no badges.

### Shape system (one rule, no exceptions)
| Thing | Radius |
|---|---|
| Buttons, inputs, icon buttons, nav capsule | 10px |
| Chips, tags, copy buttons, nav link hover | 8px |
| Cards, report container, bento cells | 18px |
| Stamp | 10px outer, 6px inner frame |
| Score ring | full circle |

No pill buttons. Borders are 1px `--line`. Only two shadows exist: none, and the report shadow (`--shadow`). Do not add drop shadows to ordinary cards.

### Viewport
Use `min-h-[100dvh]`, never `h-screen`. Use CSS Grid for multi-column layouts, not flex percentage math.

---

## 5. Components

All components read tokens, never hard-coded colors.

### 5.1 Buttons
| Variant | Style |
|---|---|
| Primary | `--ink` background, `--bg` text. Hover: `--accent` background, `--accent-ink` text |
| Ghost | Transparent, 1px `--line` border. Hover: `--surface-2` |
| Small | Padding `.55rem .9rem`, 0.88rem text |
| Icon button | 38px square, 1px `--line` border |

Labels never wrap (`white-space: nowrap`), 1 to 3 words. Active state: `translateY(1px) scale(.98)`. Disabled while a scan runs: label becomes a spinner plus "Scanning".
**One label per intent.** The scan action is always exactly **"Scan a repo"**, in the nav, hero, pricing and closing section.

### 5.2 Repo input (the core control)
- Label sits **above** the input (`Public GitHub repository`), never as a placeholder. Placeholder is an example: `github.com/your-name/your-repo`.
- Field: `--bg` background, 1px `--line`, 10px radius, GitHub icon on the left, mono 0.9rem text.
- Focus: border `--accent` plus a 3px `--accent-tint` halo.
- Invalid: border `--ink` plus a 2px `--ink` ring, and a bold message below (`Paste a GitHub link, like github.com/name/repo`). The error is monochrome on purpose.
- Validate with `/github\.com\/[^\/\s]+\/[^\/\s]+/i` on the client, and again on the server.

### 5.3 Severity tags (monochrome)
Mono 0.78rem, padding `.3rem .6rem`, 8px radius.

| Level | Style |
|---|---|
| High | Solid `--ink` fill, `--bg` text |
| Medium | Transparent, 1px `--ink` border, `--ink` text |
| Low | `--low-tint` fill, `--low` text |

Order findings High, then Medium, then Low. The tally line (`2 high`, `3 medium`, `1 low`) uses the same tags.

### 5.4 The stamp
The signature element. Mono 600, 0.82rem, uppercase, letter-spacing 0.2em. Padding `.8rem 1.25rem`, 2px border, 10px radius, rotated -7 degrees. An inner frame (`::before`, inset 3px, 1px border, 6px radius, 50% opacity) gives the double-border rubber-stamp look. A second line in 0.6rem (`by Signoffly`, or the issue count) sits beneath.

| State | Label | Style |
|---|---|---|
| Signed off | `Signed off` | Solid frame in `--accent`, accent text |
| Needs work | `Needs work` | **Dashed** frame in `--ink` |
| Blocked | `Blocked` | **Filled** `--ink`, `--bg` text, inner frame in `--bg` |

Landing animation (when a verdict appears): 600ms, `cubic-bezier(.2, .9, .3, 1.15)`, from `scale(1.8) opacity 0` through `scale(.95)` to `scale(1)`, rotation fixed at -7 degrees. Under `prefers-reduced-motion` the stamp simply appears.
Use the stamp for verdicts only: hero, report header, shareable badge. Never as a section decoration.

### 5.5 Score ring
132px circle, `conic-gradient` for the value over a `--surface-2` track, inner disc inset 11px in `--surface`. Number is 2.4rem weight 500, with `of 100` beneath in 0.72rem `--ink-3`. Needs-work ring is `--ink`. Signed-off ring should use `--accent` (thresholds are an open decision, section 13). Always provide `role="img"` and an `aria-label` that states the score.

### 5.6 Report
Structure, top to bottom:
1. Header: repo name (mono), meta line, verdict stamp.
2. Region bar: `Legal checks for` plus toggle chips (Indonesia, EU, California, Southeast Asia). Selected chips are `--ink` filled.
3. Summary: score ring, one-sentence verdict, short explanation (two lines max), severity tally.
4. Tabs: All, Security, Testing, Quality, Legal, each with a mono count. Active tab has a 2px `--accent` underline.
5. Findings list (ranked by severity).
6. Footer line: disclaimer plus `Sample data` while mocked.

**Finding row:** severity tag in a 96px column, then title, plain explanation (68ch max), file path in mono `--ink-3`, optional `Applies under:` line for legal items, then the fix-prompt block.

**Fix-prompt block:** bordered 10px box on `--bg`. Header bar with label (`Fix prompt for Cursor or Claude Code`) and a `Copy fix prompt` button; body is a wrapped mono `pre`. After a copy, the button turns `--accent` and reads `Copied` for 1.6 seconds. The fix prompt is a core differentiator, so it must always be present on every finding.

**States**
- Loading: skeleton lines with a shimmer, plus rotating mono microcopy every 700ms (`Cloning the repository`, `Reading your dependencies`, `Looking for keys that should not be public`, `Checking what you collect from users`, `Counting the tests that matter`). Microcopy uses `--accent`.
- Empty (a tab with no findings): short friendly line, for example `Nothing here. Good sign.` with the checks that were run listed underneath.
- Error (scan failed): plain sentence on what failed and a retry button. No stack traces.

### 5.7 Feature tiles (bento)
- A bento grid has **exactly as many cells as content** (four in the mock: 5+7 on the first row, 5 spanning two rows plus 4+3 on the second). No empty cells.
- At least two cells differ visually: the soft `--accent-tint` Legal tile, the dark `--ink` Testing tile, a plain bordered tile, and a tile fading into `--accent-tint`.
- Padding 1.75rem, 18px radius, min height 230px. Stacks to one column under 900px.

### 5.8 Badge (README)
Two-part rectangle, mono 0.78rem, 6px radius, 1px `--line` border. Left half (`Signoffly`) on `--surface-2`; right half is the state: signed off (`--accent` fill), needs work (outlined), blocked (diagonal hatch in ink). The final badge image will be generated server-side as SVG, mirroring these three styles.

### 5.9 Other patterns
- **Nav:** wordmark with seal icon, capsule of links on `--surface-2`, theme toggle, `Sign in` (ghost), `Scan a repo` (primary). Links hide under 900px (mobile menu is an open decision).
- **FAQ:** native `details` and `summary`, hairline between items, caret rotates 180 degrees on open.
- **Pricing:** two asymmetric plans, never three equal columns. The paid plan is the dark tile.
- **Footer:** wordmark, link row, one-line disclaimer. No version strings, locale strips or social-proof filler.

---

## 6. Motion

Intensity is moderate (4 of 10). Every animation must say what it communicates: hierarchy, sequence, feedback or state change. If it only "looks cool", cut it.

| Motion | Spec |
|---|---|
| Section reveal | opacity 0 to 1, translateY 18px to 0, 800ms, `cubic-bezier(.16, 1, .3, 1)`, stagger 80ms. Trigger once at 12% visibility |
| Stamp landing | See 5.4 |
| Button press | 200ms, press = `translateY(1px) scale(.98)` |
| Chevron (FAQ) | 300ms rotate |
| Skeleton shimmer | 1.3s linear sweep |
| Scan flow | Button shows spinner, report scrolls into view, 3 to 4 seconds of skeleton, then stamp lands |

Rules:
- Animate only `transform` and `opacity`.
- Respect `prefers-reduced-motion`: reveals become instant, shimmer and stamp animation stop, spinner slows.
- No `window.addEventListener('scroll')`. Use IntersectionObserver, Motion's `useScroll`, or CSS scroll-driven animation.
- No parallax, no scroll-jacking, no marquee, no custom cursors, no looping decorative animation.
- Motion lives in small client-component leaves. Server components render static layout.

---

## 7. Icons and imagery

- **Icons: Phosphor, regular weight** (`@phosphor-icons/react`). One family only. Never hand-draw SVG icons; never mix in Lucide.
- Sizes: 1.1rem inside inputs, 1.35 to 1.6rem for feature icons.
- **No photography and no fake product screenshots.** The visual is the real report component and the stamp. Never build a fake dashboard from divs.
- No customer logo wall until there are real customers. Do not invent social proof.

---

## 8. Dark mode and theming

- Light is the default. Dark is applied with `data-theme="dark"` on `<html>`, set by a toggle, remembered in `localStorage`.
- Wrap every storage read and write in `try/catch`, and render correctly when storage is unavailable.
- Set the theme once at the root. Sections never invert on their own.
- Dark accent is the lighter `#93A0FF`; text on a solid dark accent uses `--accent-ink` (`#0E0E0E`).
- Check every new screen in both themes before it is considered done.

### Tailwind v4 wiring (starting point)

```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  --bg: #FFFFFF;      --surface: #FAFAF9;  --surface-2: #F0F0EE;
  --ink: #121212;     --ink-2: #4A4A47;    --ink-3: #65655F;
  --line: #E2E2DE;
  --accent: #2338D6;  --accent-ink: #FFFFFF; --accent-tint: #E6EAFD;
  --low: #4A4A47;     --low-tint: #E6E6E3;
  color-scheme: light;
}
:root[data-theme="dark"] {
  --bg: #0E0E0E;      --surface: #171717;  --surface-2: #222222;
  --ink: #F2F2F0;     --ink-2: #B2B2AE;    --ink-3: #8F8F8B;
  --line: #2C2C2C;
  --accent: #93A0FF;  --accent-ink: #0E0E0E; --accent-tint: #1A2040;
  --low: #B2B2AE;     --low-tint: #262626;
  color-scheme: dark;
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-line: var(--line);
  --color-accent: var(--accent);
  --color-accent-ink: var(--accent-ink);
  --color-accent-tint: var(--accent-tint);
  --radius-ctl: 10px;
  --radius-card: 18px;
  --breakpoint-split: 900px;
}
```

shadcn/ui: allowed, but never in its default state. Remap its variables to these tokens and set the 10px and 18px radii before using any component.

---

## 9. Voice and copy

Calm, direct and kind. Write for a founder who is nervous about launching.

**Do**
- Say what happened, why it matters, and what to do, in that order.
- Use concrete verbs and everyday words. `Anyone who can see this repo can charge and refund on your account.`
- Keep headlines short and sentence case. Keep sub-paragraphs to about 25 words.
- Use real, believable sample data. Mock numbers must be labeled `Sample data`.

**Don't**
- No em dashes or en dashes anywhere in UI copy. Use a period, comma or hyphen.
- No filler verbs: elevate, seamless, unleash, next-gen, revolutionize.
- No fake precision (`99.9%`) and no invented testimonials, logos or customer counts.
- No scroll cues, version labels in the hero, or section-number eyebrows.
- No cute or poetic labels. Plain functional labels only.

**Legal wording (non-negotiable).** Legal results are findings to review, never verdicts. Always show `A finding to review, not legal advice.` where a legal finding appears, and keep the footer disclaimer. Never write "compliant", "guaranteed" or "certified". Say "may apply under" or "applies under" with the region named.

**Language.** English first. Bahasa Indonesia comes later: keep all UI strings in a message catalog from day one so translation is a data change, not a refactor.

---

## 10. Accessibility checklist

- Text and UI contrast meets WCAG AA in both themes.
- Visible focus ring on every interactive element: 2px `--accent`, 3px offset.
- Inputs always have a visible label above them and an associated error via `aria-describedby`; errors use `role="alert"`.
- Status is never color-only: severity differs by fill, outline and label; stamp states differ by frame style and text.
- Tabs use `role="tablist"`, `role="tab"` and `aria-selected`. Region chips use `aria-pressed`.
- Score ring and any graphic carry text alternatives.
- Everything works with keyboard only and with reduced motion enabled.

---

## 11. Anti-patterns (reject in review)

- Purple or blue-purple gradients, glassmorphism, glow shadows, mesh backgrounds as decoration.
- Three equal feature cards in a row; more than two consecutive image-and-text splits.
- A left headline with a small explainer paragraph floating on the right as a section header.
- Colored decorative dots, status dots on every row, or decorative hairline crosshairs.
- More than one marquee, any custom cursor, any scroll-jacking.
- Duplicate CTAs with the same intent but different labels.
- Cards wrapped around everything. Prefer spacing and hairlines; use a card only when elevation means something.
- A long list rendered as a default bulleted list with a border on every row.

---

## 12. File and folder conventions (for the Next.js app)

Suggested, to be confirmed when the app is scaffolded:

```
src/
  app/                  routes, layouts, globals.css (tokens live here)
  components/
    ui/                 buttons, inputs, tags, tabs (token-driven primitives)
    report/             stamp, score-ring, finding, fix-prompt, region-bar
    marketing/          hero, how-it-works, bento, pricing, faq
  lib/                  validation (repo URL), theme helpers
  messages/             en.json now, id.json later
docs/
  design-guide.md       this file
```

Motion and any scroll or pointer logic stay in small `"use client"` leaf components.

---

## 13. Open decisions and placeholders

These are deliberately unresolved. Do not treat the mock's values as final.

1. **Pricing.** `$0` free and `$9` per scan are layout placeholders only.
2. **Verdict thresholds.** What score or issue count maps to Signed off, Needs work and Blocked is undecided (the mock uses 63 and 2 high issues as a "needs work" example). Score ring color for signed off follows from this.
3. **Mobile navigation.** The mock hides the links under 900px. A menu pattern is not designed yet.
4. **Real badge asset and domain.** The mock uses `signoffly.example`. The real domain (`.io` and `.dev` looked free) is unconfirmed.
5. **Warning color.** None exists by design. Revisit only if a real need appears.
6. **Empty and error screens** beyond the one-line patterns in 5.6.
7. **Indonesian copy** and a language switcher.
8. **Account and dashboard screens** (scan history, billing, settings) are not designed. Reuse the tokens and components above; do not invent a new look.
