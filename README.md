# Dennis Hsiao — Personal website

Primary domain: https://dennis-tw.com/

## Development

Node.js 20+, no build dependencies. Run `npm run dev`, `npm run check`, and `npm run build`. Netlify publishes `dist/` and automatically deploys GitHub main.

## Pages and content

- `/`: short introduction and navigation.
- `/experience/`: work, entrepreneurship and volunteering.
- `/education/`: degree studies and international learning.
- `/certifications/`: six credentials.

Edit `scripts/resume-data.mjs` for bilingual resume content. `scripts/generate-pages.mjs` generates the four static pages and translation dictionary during builds, retaining social icons from the home page. The public relations title was corrected by Dennis to Head of Public Relations. Other career content was summarized from Dennis’s LinkedIn profile on 2026-10-24. No credential numbers or private account information is published.

## Interaction

Independent scroll-revealed timelines, Chinese/English language preference, grouped social icons, and a pointer-responsive triangular background lattice with fading illumination. Reduced-motion and touch visitors receive a static subtle grid. No backend or visitor data collection. Fonts use Google Fonts with local fallbacks.
