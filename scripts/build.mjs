import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
await import('./generate-pages.mjs');
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });

// Every page loads the viewing mask first, before any other script or style paints.
const GATE_TAG = '<script src="/gate.js"></script>';
async function injectGate(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await injectGate(path);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(path, 'utf8');
      if (!html.includes(GATE_TAG)) await writeFile(path, html.replace('<head>', `<head>${GATE_TAG}`));
    }
  }
}
await injectGate('dist');
console.log('Built Dennis website into dist/');
