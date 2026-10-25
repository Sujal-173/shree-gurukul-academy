# Page-by-page CMS

## Entry points

- `/admin/pages` — page editor index
- `/admin/pages/home` — homepage content
- `/admin/pages/about` — About page
- `/admin/pages/academics` — Academics page
- `/admin/pages/admissions` — Admissions page
- `/admin/pages/facilities` — Facilities page
- `/admin/pages/school-life` — School Life page
- `/admin/pages/gallery` — Gallery page
- `/admin/pages/vision` — Vision & Values page
- `/admin/pages/notices` — Notices page
- `/admin/pages/calendar` — Calendar page
- `/admin/pages/contact` — Contact page
- `/admin/pages/disclosure` — Disclosure page
- `/admin/pages/privacy` — Privacy Policy page
- `/admin/pages/site-settings` — brand, contact details, navigation, footer, SEO and social preview settings

Admin pages use a separate Next.js route group while keeping these `/admin` URLs. Public content is cached; saving a published CMS update invalidates that cache so visitors receive the latest version without a manual refresh.

Every page editor checks the existing signed admin session on the server. It uses the current content API for writes, so the existing request validation, origin checks, rate limiting, sanitization, database storage, and content revisions continue to apply. Text and image fields are edited in a page-specific form; structured lists have add, remove, reorder, and image selection controls. Page-specific saves include a scope, which merges only the page being edited into the latest stored content so unrelated page changes are preserved when another editor is open. The full-site advanced editor remains available for an intentional whole-content replacement.

## Editing workflow

1. Sign in at `/admin/login`.
2. Open **Page editors** in the admin sidebar or visit `/admin/pages`.
3. Open the desired page card.
4. Edit the fields and structured lists; uploads require MongoDB and Cloudinary configuration.
5. Review the unsaved changes status and use **Save changes**.
6. Use **Preview page** to inspect the public result.

The media library and image upload endpoints require the configured database and Cloudinary environment variables. If the services are not configured, page text can still be edited locally, but saves and persistent media uploads will return a configuration error.

## Gallery photos

The admin overview includes a gallery summary with photo and public-category counts, alt-text reminders, image previews and shortcuts to edit or preview the gallery.

In the Gallery page editor, add approved photos, descriptive alt text, captions, and a **Tag / category**. The editor shows photo previews and identifies missing alt text; photos without a category tag are automatically grouped using their title and caption. Visitors can hover or focus a photo to reveal its caption, and select it to open the full-screen viewer with previous/next controls.

## School calendar

In the Calendar page editor, update the planner heading, academic session, publishing office and empty-state copy. Add official planner items with a tab label, title, accessible image description and uploaded image; enable **Published** to show each tab to visitors. Visitors can switch planner tabs and select the image to view it at full size. Dated announcements continue to be managed separately through the homepage and Notices editors.
