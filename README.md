# Dennis — 想法不設限

Personal website for Dennis. Primary domain: https://dennis-tw.com/

## Local development

Requires Node.js 20+. No dependency installation required.

```sh
npm run dev
npm run check
npm run build
```

Open http://127.0.0.1:4173. Build output is `dist/`.

## Deployment

Import this repository into Netlify. The included `netlify.toml` configures the build and publish directory. Set `dennis-tw.com` as the primary custom domain, then add `www.dennis-tw.com` as an alias. Use the DNS targets shown by Netlify in the existing Cloudflare zone; preserve unrelated mail and verification records. The included redirect sends www traffic to the primary domain.

## Content and interactions

Edit personal copy and links in `public/index.html`, styles in `public/style.css`, and experiments in `public/app.js`. The three experiments are illustrative demos, not claims about past professional work. Features include particle animation, scroll reveals, category filters, keyboard-accessible dialogs, color and orbit controls, and editable typography. Reduced-motion preferences are respected. This version has no backend or visitor data collection.

Fonts use Google Fonts with system fallbacks.
