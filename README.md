# G1 Creative Agency — Website

React + Tailwind rebuild of the print shop's site: home page, order wizard,
portfolio, staff dashboard, and policy pages, all connected with a shared
nav/footer and React Router.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in your real values
npm run dev
```

## Environment variables

Set these in Netlify (Site settings → Environment variables) and in
`.env.local` for local dev. See `.env.example` for the full list:

- `VITE_SHOP_WHATSAPP` — WhatsApp number orders get sent to
- `VITE_UPLOAD_ENDPOINT` — only used as a fallback for local development when Supabase keys are missing. Live uploads go to Supabase Storage.
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — order database + staff login

Without the Supabase variables, the order form still works (it sends via
WhatsApp) but won't save a copy to the dashboard, and both the Portfolio
and Dashboard pages will show a "not connected" state instead of crashing.

## Deploy to Netlify

1. Push this project to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Add the environment variables above before the first deploy.
5. `public/_redirects` is already set up so React Router's routes work on
   refresh and direct links (not just when navigating from the home page).

## What changed from the original HTML pages

- **Order form**: the whole step-by-step wizard (job type, copies, file
  upload, per-product-type questions, review ticket, WhatsApp send) was
  ported to React. The logic — job catalog, profile-specific fields, ticket
  drawing on canvas, Catbox upload, Supabase save, WhatsApp handoff — is the
  same; only the UI layer changed. **This is a from-scratch rewrite, not a
  copy-paste of tested code, so test the full flow (including a real
  WhatsApp send and a Supabase save) before relying on it.**
- **Secrets**: the Supabase URL/key and WhatsApp number used to sit in plain
  HTML `data-*` attributes. They now come from environment variables
  (`src/lib/config.js`) so they're not committed to source and can differ
  between local/staging/production.
- **Navigation**: every page now shares one header and footer, with working
  links between Home, Order, Portfolio, and all three policy pages. The
  staff Dashboard is intentionally **not** in the public nav — same as your
  original `index.html` note ("keep that URL private, share it with staff
  only"). It's reached at `/dashboard`.
- **Home page**: your original `index.html` was a local testing index, not
  a public homepage. I replaced it with an actual marketing landing page
  (services, how-it-works, calls to action) since the site now needs one to
  connect the other pages meaningfully.
- **Policy pages**: same content as your drafts, plus a few additions —
  see below.

## Policy gaps — needs your decision, not mine

These are marked `CONFIRM` right in the Terms and Refund pages, same as
your originals:

- Pricing/payment timing, turnaround time, cancellation policy, refund
  timeframe, and whether a reprint is free or chargeable when the *order
  details* (not our printing) were wrong.
- New: design ownership when the shop creates custom artwork (not one you
  supplied) — can it be reused or resold elsewhere?
- New: a liability limit clause and a governing-law/dispute clause — get
  local legal advice on the wording before publishing.

I also added, as reasonable drafts you can edit:
- An age/capacity-to-contract line in Terms.
- A children's-privacy line in Privacy.
- A note in Privacy that Supabase/Catbox may store data outside Ghana
  (cross-border transfer) — not covered in the original draft.

**Security note, separate from policy wording:** the Supabase anon key is
meant to be public, but it only stays safe if your Supabase Row Level
Security policies actually restrict what an anonymous or staff request can
read/write. Worth double-checking with whoever set up the database tables.

## UI/UX update notes

- Fonts (Bricolage Grotesque for headings, Public Sans for text) load from Google Fonts in `index.html`; system fonts are the fallback.
- Service rows on the home page link to `/order?job=<key>` (keys come from `JOB_CATALOG` in `src/lib/orderLogic.js`).
- Shared button/field styles live in `src/index.css` (`.btn-primary`, `.btn-ghost`, `.btn-send`, `.field`).
- `src/lib/orderLogic.js` and all data/WhatsApp/Supabase logic are unchanged.
- Animations are defined in `src/index.css` (inside `prefers-reduced-motion: no-preference`, so visitors who turn motion off get none). Scroll-in effects use `src/components/Reveal.jsx`.
- The home hero has an animated network background (`src/components/HeroBackground.jsx`, Vanta.js + Three.js). `three` is pinned to 0.134.0 because Vanta needs that older API. It loads lazily, only while the hero is on screen, and is skipped on reduced-motion, Data Saver, slow connections, low-memory phones and devices without WebGL. After `npm install`, check the build size with `npm run build`.

## File storage (Supabase)

- Customer order files and ticket images go to the **private** `order-files` bucket (25 MB limit). Visitors can upload but not read. Orders store `sb:<path>`, and the staff dashboard asks Supabase for a 5-minute link when someone taps "View ticket" or "Download file".
- Portfolio photos go to the **public** `portfolio` bucket (staff-only upload and delete).
- Older orders that already have Catbox links keep working.
- The WhatsApp message lists the order details as text and includes an "Open ticket" link (`/dashboard?order=<code>`). Staff log in, the dashboard jumps to that order and highlights it, and "View ticket" / "Download file" are one tap away. Private files have no public link.

## Logo files (`public/`)

- `logo-mark.png`: the G1 mark on a transparent background (header, footer, staff login).
- `logo-full.png`: mark + "G1 Creative Agency" wordmark, transparent. Gold wordmark, so use it on dark backgrounds only.
- `favicon.ico`, `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`: browser tab and home-screen icons.
- `og-image.jpg` (1200x630): for link previews. To use it, add `<meta property="og:image" content="https://YOUR-DOMAIN/og-image.jpg" />` to `index.html` (it needs your full web address).
- These were cut out of the JPG you supplied. If you have the original vector or PNG with a transparent background, swap it in for sharper edges.
