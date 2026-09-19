# G1 Creative Agency - Print Order System

## Files

```
index.html LOCAL TESTING ONLY - do not upload this one, see below
print-order.html customer order form - QR code should point HERE
portfolio.html public gallery of past work
dashboard.html staff-only order + portfolio management (password protected)
404.html shown automatically for broken/missing links, see below
supabase-setup.sql one-time database setup - run in Supabase SQL Editor
serve.py optional local-only helper, see "Run it locally"
```

## Run it locally

Don't just double-click the files open in a browser - opening via `file://`
can make the Supabase/upload requests behave unreliably in some browsers.
Serve the folder over a real local address instead. Pick whichever you have:

**Python - with working 404 page (recommended):**
```
cd path/to/this/folder
python3 serve.py 8000
```
This is the same as plain `http.server` but also shows `404.html` for
missing pages, matching what happens on the real deployed site. Then open
**http://localhost:8000**.

**Python - plain, if you don't need to test the 404 page:**
```
python3 -m http.server 8000
```
Note: this version will show its own generic error page instead of
`404.html` - that's a limitation of the plain server, not the site itself.

**Node (if you have it):**
```
npx serve .
```
It'll print the local address to open (usually http://localhost:3000).

Either way, `index.html` gives you a menu to reach the pages while testing - it's a local convenience only, not part of the actual site.

## The 404 page

`404.html` is picked up **automatically, with zero configuration**, by every
major static host - Netlify, GitHub Pages, Cloudflare Pages all look for a
file with exactly this name at the root and serve it for any broken link.
Nothing to wire up on your end once it's deployed.

## First-time database setup (only needed once, not per-device)

1. Go to your Supabase project → **SQL Editor** → paste in `supabase-setup.sql` → Run.
 Safe to re-run any time - it won't touch existing data.
2. Supabase → **Authentication → Users → Add user** - this is the staff
 login for `dashboard.html`. No public sign-up page exists, on purpose.

## Going live (after local testing looks good)

Upload these four: **`print-order.html`**, **`portfolio.html`**,
**`dashboard.html`**, and **`404.html`**. Leave out `index.html` and
`serve.py` - both are local-only conveniences, not part of the actual site.

Drag those four files into **netlify.com/drop** (or push to GitHub Pages,
or any static host - no build step, no server code). You'll get a public
URL. Generate a QR code pointing at `<your-url>/print-order.html`.

Don't link `dashboard.html` from anywhere public - not from
`print-order.html`, not from `portfolio.html`, not from anywhere. Its
address should only ever be typed in directly or bookmarked by staff.
Login is still password-protected either way, but there's no reason to
advertise where the admin panel lives.

## What's already wired up

- Orders go to WhatsApp instantly **and** save to the Supabase database for
 the dashboard, independently - one failing doesn't block the other.
- File/ticket-image uploads go through catbox.moe (free, no account needed)
 and the resulting links are what actually get sent - not the raw files.
- Job-specific questions (paper size vs shirt size vs card finish, etc.) are
 handled by the profile system in `print-order.html` - see `JOB_CATALOG`
 and `getProfileFields()` if you need to add another product type.
- All icons are custom-drawn inline SVG (no emoji, no external image
 dependency) - the sprite is near the top of each HTML file's `<body>`.

See `PROJECT_SPEC.md` (if you have it from earlier) for the full technical
breakdown of every function, and `full-source-export.md` for the complete
current source of all four files in one place.
