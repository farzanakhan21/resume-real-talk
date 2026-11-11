# Roast My Resume — Session Handoff

_Last updated: 2026-11-12. Paste this file (or point Claude at it) at the start of a new session to continue._

## What this is

Roast My Resume (by **nurhr** / "not ur regular hr") — AI resume analysis with a free roast and a paid full report.

- **Frontend:** React 18 + Vite SPA. State-based routing in `src/App.jsx` (`view` = home / loading / results / faq / terms) — no react-router.
- **Styling:** plain CSS in one file, `src/index.css` (~3.4k lines). **No Tailwind.** Landing classes use the `lp-` prefix.
- **Backend:** Express app in `server.js`, served on Vercel as a serverless function via `api/index.js` (`vercel.json` routes `/api/*` and `/admin*` to it).
- **Services:** Anthropic (analysis), Stripe (checkout + webhook), Resend (email), Supabase via plain REST — no SDK (table `analyses`, resume PDFs in Supabase Storage).
- **Hosting:** Vercel project `resume-real-talk`. Pushing to `master` deploys production.

## Branches

| Branch | State |
|---|---|
| `master` | **Production.** Default branch (there is no `main`). |
| `rebrand-nurhr` | **Paused WIP**, not merged. Rebrand to the nurhr Visual System v1 (Newsreader/Archivo, plum `#4B1E43`, gold `#C4A048`, cream `#FBF6EC`). Includes `Lockup`, `Annotation`, `HandUnderline` components. Last commit is an interrupted token rebuild. |
| `fix-hero-spacing`, `visual-refresh-v2` | Old, already merged. |

## Current design on `master` — "Dusty Plum"

Tokens at the top of `src/index.css`: `--plum #6B4A7A`, `--plum-dark #4D3358`, `--plum-light #9B7AAA`, `--plum-tint #F0E8F5`, `--plum-tint2 #E3D5EC`, `--gold #D4A84B`, `--ink #1C1220`. Legacy names (`--purple`, `--accent`, `--lp-purple-*`, …) are aliases that point at these. Fonts on master are still Inter / Space Grotesk / DM Serif Display.

**Homepage order (`App.jsx`):** Nav → Hero → ProofBar → Who → CTA → About ("why trust me with your resume?" card with photo) → What You Get → Proof (CSS marquee) → roast form → Footer.

## Recent work (newest first)

- Supabase PDF storage with 90-day auto-delete; Executive & Administration Support industry added (from another session).
- Stripe webhook `/api/webhook` now records `is_paid=true` in Supabase via `markAnalysisPaid` (signature-verified).
- Navbar and footer logos: "N" fades out on load (0.5s delay, 0.8s) to reveal "URHR".
- About section: heading "why trust me with your resume?", metric tiles removed, new story copy, subtitle "Founder, HR", gold link "this is just the start. work with me →" to `https://www.noturregularhr.com/#/careers`.
- New founder headshot `public/farzana-headshot.webp`.
- Canonical / OG / Twitter tags and `APP_URL` point at `https://roast.noturregularhr.com`.
- Dusty Plum recolour. Pricing $29.99 AUD with a struck-through $79 "beta pricing" anchor.

## Open items / TODO

1. **Stripe live webhook (dashboard).** Add endpoint `https://roast.noturregularhr.com/api/webhook` (or `https://resume-real-talk.vercel.app/api/webhook`) for event `checkout.session.completed`, then set `STRIPE_WEBHOOK_SECRET` in Vercel (Production). Until it's set, the handler no-ops. Note: the webhook records payment but does **not** send the report PDF — an optional fallback "view your report" email could be added.
2. **Mark 3 customers as paid in Supabase — pending.** The emails are in the session transcript (not stored here, since it's customer data). Easiest: Supabase SQL editor → `update analyses set is_paid = true where email in (...) returning email, date, is_paid;`. Supabase keys are **not** in local `config.json`, only in Vercel env.
3. **Domain move to `roast.noturregularhr.com` (dashboards).** Vercel: add domain + DNS CNAME, set `APP_URL=https://roast.noturregularhr.com`, redeploy. Stripe: webhook URL (above). Supabase: only if Auth or CORS is used. Resend sending domain stays `noturregularhr.com`; email addresses stay on the root domain.
4. **Dead code to clean up (optional):** `src/components/landing/LandingTrust.jsx` + its `.lp-trust*` CSS; old unused components `Hero`, `About`, `HowItWorks`, `Testimonials`, `WhyDifferent`, `MetricsStrip`, `FounderIntro`, `SeeWhatYouGet`, `LandingDiff`; `public/farzana.png`.
5. **Resume the nurhr rebrand** on `rebrand-nurhr` when ready. Its source of truth is `Roast My Resume x nurhr - Visual System v1 (standalone).html` at the repo root — **untracked, not in git** (see below).

## Files NOT in git (copy manually if you change computers)

`config.json` (secrets), `.env`, `Roast My Resume x nurhr - Visual System v1 (standalone).html`, `design_handoff_roast_my_resume/`, `roast my resume.zip`, `landing-export.html`, `generate-sample-pdf.mjs`.

## Secrets

Local dev reads `config.json` (gitignored): Anthropic, Stripe secret/webhook/price, Resend, `APP_URL`, `ADMIN_PASSWORD`. Production reads Vercel env vars (including `SUPABASE_URL` / `SUPABASE_KEY`). Never commit them.

## Working preferences (how Farzana likes to work)

- Commit **only when asked**. "commit" means local only; "push" / "commit and push" means push to `master`.
- Never include `.claude/settings.local.json` or the untracked design/zip files in commits.
- Use normal hyphens, not em dashes, in site copy.
- Headlines are lowercase (brand voice). Keep copy verbatim when it's given.
- Verify changes in the browser preview before reporting. Flag premise mismatches (wrong file, nonexistent branch, missing Tailwind) instead of guessing.

## Run locally

```bash
npm install
npm run dev
```

Needs `config.json` in the repo root. Preview config is in `.claude/launch.json` (Vite on port 5173).
