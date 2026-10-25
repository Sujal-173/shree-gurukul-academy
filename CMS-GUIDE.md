# Gurukul Academy CMS Guide

## Before the first login

The CMS requires a reachable MongoDB database, Cloudinary image credentials, an admin email, a bcrypt password hash, and an `AUTH_SECRET` of at least 32 characters. Configure these only in your deployment provider's secret settings or a private local `.env.local` file. Never commit secrets to version control.

Required environment variables:

- `MONGODB_URI`
- `MONGODB_DB_NAME` (optional; defaults to `gurukul_academy`)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONTACT_EMAIL` are optional for email notifications; form submissions are stored in MongoDB when it is configured.

Create a password hash using the project's `npm run hash-password` helper on a trusted machine; do not store the plaintext password in the environment file. For local `.env.local`, copy the escaped line the script prints because Next.js expands `$` inside dotenv values. For hosting dashboards such as Vercel, paste the raw hash without backslashes.

## Log in

Open `/admin/login` on the deployed site. There is no public admin signup. The single administrator is provisioned by the deployment environment. Sessions use an HTTP-only, SameSite=Strict cookie and expire after eight hours.

## Change website content

1. Open **Website content**.
2. Edit the **Academy profile**, hero slides, homepage text, highlights, values, statistics, leadership profiles, notices, page copy, page sections, FAQs, admission steps, academic levels, disclosure documents, navigation, footer, or SEO fields.
3. For images, choose an existing upload or upload a new JPG, PNG, WebP, or AVIF image directly in the image field. The new image is linked to that field in the unsaved draft immediately.
4. Use **Add**, **Remove**, **Move up**, and **Move down** to manage ordered content. Keep at least one hero slide.
5. Update the header enquiry CTA, homepage intro/final CTA labels and links, and footer column headings in the same editor.
6. Click **Save website content** to publish. Uploads are stored in Cloudinary as soon as the upload completes; the image assignment itself remains a draft until content is saved.
7. Review the live public page using **View website**. Keep a JSON backup before major revisions.

The additional text fields in each page editor are inferred from that page's stored string properties. Some functional labels are controlled by application components and are intentionally not editable as arbitrary code.

## Media library

The media library lists recent uploads, dimensions and formats. Images are optimized for delivery by Cloudinary. The server checks the declared image type against the file signature, requires an authenticated admin, verifies same-origin requests, and applies rate limits. An image still referenced by saved website content cannot be deleted. Replace the reference and save the updated content before retrying deletion.

## Content history

After the first content change has been saved, older content snapshots appear in **Content history**. Select **Review as draft** to load a snapshot into the editor. This does not publish it automatically; review and save it deliberately.

## Enquiries

Contact and admission form submissions are stored in the database when configured. The admin **Enquiry inbox** shows the latest 100 submissions and lets the administrator mark an item new, in progress, or resolved. Configure email delivery separately if email alerts are needed.

## Safe publishing checklist

- Replace the illustrative images with approved academy photographs and use accurate alt text.
- Confirm all director/principal names, titles, messages, academic facts, dates, fees, and official documents before publishing.
- Verify the configured WhatsApp number and school email.
- Keep a verified backup and enable database backups.
- Deploy behind HTTPS and use a secret manager for server credentials.
- The current rate limiter is process-local; a horizontally scaled production deployment should use a shared rate-limit store at the edge or in Redis.
- Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` in a network-enabled environment before launch.
