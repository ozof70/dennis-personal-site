import { cp, mkdir, rm } from 'node:fs/promises';

// Temporary: the whole site is a single cartoon page. The full site still lives in
// public/ and scripts/; restore the previous build.mjs to bring it back.
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('temp/index.html', 'dist/index.html');
await cp('public/favicon.svg', 'dist/favicon.svg');
console.log('Built temporary cartoon page into dist/');
