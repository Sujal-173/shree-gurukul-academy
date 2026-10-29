# Deployment checklist

## Before deploy
- Use the exact supported Node.js 22 range declared in `package.json` (currently `>=22.23.4 <23`) and install from `package-lock.json` with `npm ci`.
- Configure all required variables from `.env.example` in your hosting provider secret manager.
- Set `NEXT_PUBLIC_SITE_URL` to the production HTTPS origin.
- Create the admin password hash with `npm run hash-password -- "a-unique-password-longer-than-12-chars"`; store only the hash in `ADMIN_PASSWORD_HASH`.
- Configure MongoDB Atlas database user and network policy. Confirm the app can read/write `siteContent`, `media`, and `inquiries`.
- Configure Cloudinary using `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`; uploads are disabled if server credentials are missing. Images and PDF school attachments use the authenticated admin upload API.
- If using Resend, verify the sender domain/address and add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONTACT_EMAIL`.
- To sync enquiries to separate Google Sheets tabs, enable the Sheets API, create a service account, share the target spreadsheet with its email as an Editor, and add `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_SHEET_ID` to the hosting provider's secrets. Optionally configure `GOOGLE_CONTACT_SHEET_TAB` and `GOOGLE_ADMISSION_SHEET_TAB`; missing tabs are created automatically. Keep the private key server-only.

## Verify in preview
1. Confirm `/`, every content page, `/sitemap.xml`, and `/robots.txt` return the expected page and metadata.
2. Sign in at `/admin/login`; verify wrong credentials are rejected and `/admin` redirects when unauthenticated.
3. Edit the title, hero image URL and one notice; save, open a second browser, and verify persisted changes. Restore content backup after the test.
4. Upload a permitted image and a PDF circular. Verify the Cloudinary URL, image poster, PDF link and media record. Confirm files larger than the applicable 8 MB image / 12 MB attachment limit, unsupported MIME values and mismatched file signatures are rejected.
5. In the Calendar editor, create an event, holiday and exam record; attach an image to one and a PDF to another; create a school calendar resource and a class-specific exam timetable. Test draft, publish, unpublish, edit, remove and public display on `/calendar`, `/calendar/events`, `/calendar/holidays`, `/calendar/exams` and `/notices`.
6. Add a notice with an image poster and separate PDF circular to the homepage and notice board. Save the page, refresh, and confirm the file and metadata persist.
7. Submit valid and invalid contact/admission forms; check the Mongo record, admin inbox, status update, optional notification mail, and Google Sheet row if Sheets sync is configured. Verify retry for an unsynced enquiry.
8. Verify responsive layout at 320, 375, 768, 1024 and desktop viewport sizes. Check keyboard focus, menu state, reduced motion, label/error feedback and contrast.
9. Test backup restore, MongoDB backup/restore and credential rotation procedures.
10. Run build, typecheck, lint and tests. Do not promote if checks fail.

## Operational security
- Enable HTTPS; only production cookies are marked Secure.
- Keep MongoDB and Cloudinary secrets server-only.
- Use an upstream distributed rate limiter and monitoring for multi-instance deployments.
- Review CSP against any future integrations before enabling them.
- Configure platform log retention, backups and incident-response contacts.

## CMS backups and image security

Each changed CMS save stores the previous content snapshot in `siteContentVersions`. The admin history interface exposes only the 25 most recent snapshots; reviewing a snapshot loads it into an unsaved draft, so rollback always requires explicit review and a normal save. Configure MongoDB backups as a separate operational recovery measure; CMS history is not a replacement for database backups.

Image upload endpoints require an authenticated admin session and same-origin POST request, enforce a file-size and MIME allowlist, and validate file signatures before Cloudinary upload. Keep Cloudinary secrets server-only. The built-in rate limiter uses process memory; for horizontally scaled production deployments, add a shared rate limiter at the platform/edge layer and ensure the reverse proxy sanitizes forwarded client-IP headers.


## Canonical public URL and search metadata

Set `NEXT_PUBLIC_SITE_URL=https://www.shrigurukulacademy.in` in the production environment. The site uses `/admission` as the canonical route; `/admissions` is a permanent redirect only and is not included in the sitemap. Page metadata includes canonical URLs, page-specific descriptions, Open Graph and X/Twitter cards, robots directives, and School/WebSite/Breadcrumb/FAQ JSON-LD where relevant. `public/llms.txt` is an optional plain-text discovery aid for AI retrieval systems; it is not a ranking guarantee.

Before publishing: verify current school details, replace illustrative artwork with actual approved campus/student photographs, check the contact email and phone, confirm Google Search Console ownership, and submit `/sitemap.xml`.
