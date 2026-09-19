// CV PDF build + sync.
// The CV is authored in a separate rendercv project (the source of truth):
//   /Users/nikitaboarkin/Desktop/00 ide/00 portfolio/cv
//     Boyarkin_Nikita_Product_Analyst_CV.yaml -> rendercv_output/Boyarkin_Nikita_CV.pdf
//
// This script prepends the branded A4 cover (scripts/generate-cv-cover.mjs) and
// writes the result to public/CV-Nikita-Boyarkin.pdf, so the shared link's
// preview shows a designed page 1 instead of a dense wall of resume text.
//
// Set CV_NO_COVER=1 to ship the plain one-page resume instead.
//
// Run: bun run cv:pdf
// Not wired into the build — re-run after `rendercv render` in the cv project.

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { renderCvCover } from './generate-cv-cover.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CV_YAML = 'Boyarkin_Nikita_Product_Analyst_CV.yaml';

// Sibling rendercv project by default; override with CV_SOURCE_DIR if it moves.
const CV_PROJECT = process.env.CV_SOURCE_DIR ?? join(ROOT, '..', 'cv');
const SRC = join(CV_PROJECT, 'rendercv_output', 'Boyarkin_Nikita_CV.pdf');
const OUT = join(ROOT, 'public', 'CV-Nikita-Boyarkin.pdf');
const COVER = join(ROOT, 'public', 'images', 'og', 'cv-cover.pdf');

if (!existsSync(SRC)) {
  console.error(
    `Missing ${SRC}.\nRe-render the CV first:\n  (cd "${CV_PROJECT}" && rendercv render ${CV_YAML})`
  );
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });

if (process.env.CV_NO_COVER === '1') {
  copyFileSync(SRC, OUT);
  console.log(`Synced CV PDF → public/CV-Nikita-Boyarkin.pdf (no cover)`);
} else {
  if (!existsSync(COVER) || process.env.CV_REBUILD_COVER === '1') {
    await renderCvCover(COVER);
  }
  const res = spawnSync('pdfunite', [COVER, SRC, OUT], { encoding: 'utf8' });
  if (res.error || res.status !== 0) {
    console.error(
      `pdfunite failed (${res.error?.message ?? res.stderr ?? res.status}).\n` +
        `Install poppler (brew install poppler) or set CV_NO_COVER=1 to ship the plain resume.`
    );
    process.exit(1);
  }
  console.log(`Synced CV PDF → public/CV-Nikita-Boyarkin.pdf (cover + resume)`);
}
