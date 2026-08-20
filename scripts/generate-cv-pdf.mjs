// CV PDF generator.
// Renders dist/cv/index.html via headless Chrome --print-to-pdf into
// public/CV-Nikita-Boyarkin.pdf (so it ships with the static build).
// Run: npm run build && npm run cv:pdf
// Not wired into the build — run manually when cv.astro changes; commit the PDF.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST_CV = join(ROOT, 'dist/cv/index.html');
const OUT = join(ROOT, 'public/CV-Nikita-Boyarkin.pdf');

const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
];

const chrome = CANDIDATES.find((p) => existsSync(p));

if (!chrome) {
  console.error('No Chrome/Chromium found. Install one of:\n  ' + CANDIDATES.join('\n  '));
  process.exit(1);
}
if (!existsSync(DIST_CV)) {
  console.error(`Missing ${DIST_CV} — run "npm run build" first.`);
  process.exit(1);
}

const res = spawnSync(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    '--virtual-time-budget=8000',
    `--print-to-pdf=${OUT}`,
    `file://${DIST_CV}`,
  ],
  { encoding: 'utf8' }
);

if (res.status !== 0) {
  console.error('Chrome --print-to-pdf failed:\n' + (res.stderr || res.stdout || ''));
  process.exit(1);
}
if (!existsSync(OUT)) {
  console.error('PDF not written — check headless Chrome flags.');
  process.exit(1);
}

console.log(`Generated CV PDF → public/CV-Nikita-Boyarkin.pdf`);
