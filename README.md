# G1 Creative Agency — Print Order (Ticketer)

This repository contains a small three-file static app (no build step) for a print shop to accept orders via a QR-code scanned customer form and a staff dashboard.

Files included:
- `print-order.html` — Customer-facing order wizard (drop onto static hosting; contains example config values)
- `dashboard.html` — Staff dashboard (login to Supabase required)
- `supabase-setup.sql` — One-time schema + RLS policies for Supabase
- `LICENSE` — MIT
- `CHANGELOG.md` — initial import
- `tests/` — manual test checklist and minimal Playwright notes

Quick start (deploy to Netlify Drop or GitHub Pages):
1. Create a Supabase project and run `supabase-setup.sql` in the SQL editor.
2. In Supabase > Authentication > Users, add a user for staff (email + password).
3. Host `print-order.html` and `dashboard.html` as static files. They already include example `data-*` attributes with the sample Supabase URL + anon key + catbox and WhatsApp number from the spec — replace these values with your own project details if desired.
4. Point a QR code at `print-order.html` for customer scanning. Staff use `dashboard.html` and login with the Supabase account.

Security & privacy notes
- The files are stored on catbox.moe (public URLs). Do not use this system for highly sensitive documents. If privacy is required, use Supabase Storage with protected buckets and a server-side signed URL flow.
- The Supabase anon key is intentionally client-visible: the RLS policy in `supabase-setup.sql` only allows inserts by anon. Verify the policy after running the SQL.
- To mitigate spam/abuse consider adding rate-limiting via a Postgres trigger or an Edge Function.

Improvements included in this import
- Accessibility tweaks (lang attribute, keyboard handlers, visible focus outlines, aria-live summary)
- Honeypot + simple timing checks to reduce bot submissions
- Upload progress feedback and retry/backoff for Supabase insert
- Content-Security-Policy meta tag for static hosting guidance

License
- MIT (see LICENSE)

Manual test checklist: see tests/MANUAL.md
