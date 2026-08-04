# Print Shop Order System

This folder contains a free, no-signup print-shop ordering system.

Overview
- Customer-facing: `print-order.html`
- Ticket view: `view.html`
- Admin dashboard: `dashboard.html`
- Serverless proxy: `netlify/functions/*` — Netlify Functions that keep the storage secret server-side and manage order IDs.

Quick start (Netlify)
1. Create a Netlify site (drag-and-drop or `netlify deploy`).
2. Add these environment variables in your Netlify site settings (Site settings → Build & deploy → Environment):
   - JSON_STORAGE_URL — the full storage URL returned by jsonstorage.net when you "Create storage". This must be the full path used for GET/PUT operations (e.g., `https://api.jsonstorage.net/v1/json/xxxxx`).
   - ADMIN_TOKEN — a secret token used to protect admin endpoints (set this to a strong password/PIN). This is your dashboard "PIN" (server-checked).
3. Deploy the site. Netlify will publish the HTML and make the functions available under `/.netlify/functions/*`.
4. On first-run: open the dashboard, use your ADMIN_TOKEN as the PIN to authenticate and create or view orders.

Notes
- The serverless functions assume `JSON_STORAGE_URL` points to a JSON blob that is an object mapping order IDs to order objects. The functions will GET that JSON, mutate it, and PUT it back.
- Files are uploaded directly from the browser to Catbox (no server-side upload in this initial scaffold). The server never sees raw files — only the resulting file URL.
- This design keeps the json storage URL and admin token off the client-side code.

Security and next steps
- Change `ADMIN_TOKEN` from its default immediately and keep it secret.
- Consider VirusTotal/file scanning and using a paid storage provider (S3) for higher volume.

