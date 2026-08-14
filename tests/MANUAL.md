# Manual tests and Playwright notes

This directory contains a brief manual test checklist and notes for adding Playwright tests.

MANUAL.md — run the following to validate the core flows

- Print-order (customer):
  1. Open print-order.html on a phone.
  2. Go through the wizard: pick a job tile, set copies, attach a small PDF/image, set name, review.
  3. On Review, tap Send. Confirm WhatsApp opens with prefilled message and ticket/file links when uploads succeeded.
  4. Repeat with "I'll bring it myself" and ensure Color/Paper/Finishing steps are skipped.
  5. Simulate file upload failure by setting UPLOAD_ENDPOINT to an invalid URL — ensure overlay shows and you can continue to WhatsApp.

- Dashboard (staff):
  1. Open dashboard.html, login with Supabase staff credentials.
  2. Confirm orders load, filter chips work, and status buttons PATCH correctly.
  3. Confirm that session expiry returns to the login screen (force 401 by revoking session).

Playwright notes:
- The static files require network access for catbox and Supabase. In CI you may mock network responses or run tests against a staging Supabase project.
- Recommended tests: happy-path order submit (mocking uploads and supabase), file-upload-failure overlay, dashboard login + status transitions.
