// CV PDF sync.
// The CV is authored in a separate rendercv project (the source of truth):
//   /Users/nikitaboarkin/Desktop/00 ide/00 portfolio/cv
//     Boyarkin_Nikita_Product_Analyst_CV.yaml -> rendercv_output/Boyarkin_Nikita_CV.pdf
// This script copies that rendered PDF into public/CV-Nikita-Boyarkin.pdf so it
// ships with the static build (the single "CV" download button links to it).
// Run: bun run cv:pdf
// Not wired into the build — re-run after `rendercv render` in the cv project.

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CV_YAML = 'Boyarkin_Nikita_Product_Analyst_CV.yaml';

// Sibling rendercv project by default; override with CV_SOURCE_DIR if it moves.
const CV_PROJECT = process.env.CV_SOURCE_DIR ?? join(ROOT, '..', 'cv');
const SRC = join(CV_PROJECT, 'rendercv_output', 'Boyarkin_Nikita_CV.pdf');
const OUT = join(ROOT, 'public', 'CV-Nikita-Boyarkin.pdf');

if (!existsSync(SRC)) {
  console.error(
    `Missing ${SRC}.\nRe-render the CV first:\n  (cd "${CV_PROJECT}" && rendercv render ${CV_YAML})`
  );
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });
copyFileSync(SRC, OUT);

console.log(`Synced CV PDF → public/CV-Nikita-Boyarkin.pdf (from ${SRC})`);
