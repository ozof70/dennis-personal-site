# Dennis Hsiao — Personal timeline

Responsive bilingual personal resume for https://dennis-tw.com/.

## Development

Node.js 20+; no third-party build dependencies.

```sh
npm run dev
npm run check
npm run build
```

Netlify builds `dist/` from `public/` with `netlify.toml`. GitHub main automatically deploys to production.

## Content

Timeline content was summarized from Dennis’s LinkedIn profile and its six certifications on 2026-10-24. `scripts/resume-data.mjs` retains the bilingual editorial source; the deployed markup is `public/index.html` and translations are in `public/language.js`. Keep these in sync when updating roles or dates. No private analytics, credential IDs, or recruiter-only information is published.

The timeline is ordered by starting date, newest first. Dates show actual intervals rather than LinkedIn’s rounded duration labels. Roles marked Present reflect the LinkedIn profile at review time.

## Interaction

Scroll reveals progressively show timeline milestones and the three social links at the bottom. Chinese/English selection is saved locally. A gently pulsing, color-shifting honeycomb cursor is enabled for mouse pointers. Reduced-motion and keyboard navigation are supported. The static site has no backend or visitor data collection. Fonts use Google Fonts with local fallbacks.
