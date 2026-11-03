# Dennis Hsiao — Personal website

Primary domain: https://dennis-tw.com/

## Development

Node.js 20+. Run `npm ci`, `npm run check`, `npm test`, and `npm run build`. Static preview: `npm run dev`. Use Netlify Dev for Functions and Blob storage integration.

## Pages and content

- `/`: introduction and category navigation.
- `/experience/`: professional experience, followed by awards and competitions.
- `/education/`: education, training and special projects.
- `/certifications/`: certifications and continuing education.
- `/portfolio/`: publicly published projects.
- `/admin/`: password-protected publishing workspace, excluded from indexing.

Edit `scripts/resume-data.mjs` for bilingual career content. `scripts/generate-pages.mjs` builds static pages and translations. The 2026-11-03 update uses Dennis's supplied Chinese and English resume PDFs. Credential issue dates not shown in those PDFs retain the dates previously verified on LinkedIn. No original PDFs, private credentials or credential IDs are included in the public repository.

## Portfolio storage and authentication

Netlify Functions require a Production secret environment variable named `ADMIN_PASSWORD_HASH`. Its value is a salted scrypt verifier in `salt:hex` format; never put the password or verifier in the repository. Generate a replacement verifier using `encodePassword` exported from `server/auth.mjs`, and update the Netlify secret. Redeploy to apply changes. Changing the verifier invalidates existing sessions.

Sessions use signed, expiring Secure/HttpOnly/SameSite cookies. Mutations require same-origin requests and valid sessions; login has an IP/domain rate limit. Netlify Blobs uses the site-wide `dennis-portfolio` store with strong reads. Uploaded files survive deployments. Only PNG, JPEG, WebP and PDF are accepted, up to 3 MB per file; the API inspects signatures. Uploaded projects become public on Publish. Unpublish moves metadata to an archive and preserves the underlying file. API asset reads require published metadata.

`npm test` verifies password and session integrity, CSRF protection, anonymous write rejection, allowed binary signatures and URL validation. Production acceptance testing must also confirm upload, public reads, persistence and unpublish.

Chinese/English preference, scroll reveals, background mesh interaction and reduced-motion support remain available. No analytics are installed. Google Fonts has local fallbacks.
