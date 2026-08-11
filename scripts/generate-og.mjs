// Per-post branded OG image generator.
// Reads src/content/posts/*.md frontmatter, renders a 1200x630 branded SVG
// per post, and converts it to PNG via rsvg-convert into public/images/og/.
// Run: npm run og
// Not wired into the build — run manually when posts change; commit the PNGs.

import { readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const POSTS_DIR = join(ROOT, 'src/content/posts');
const OUT_DIR = join(ROOT, 'public/images/og');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Naive frontmatter parse — only needs title / category / draft.
function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = m[1];
  const get = (key) => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    if (!line) return undefined;
    return line[1].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  };
  return { title: get('title'), category: get('category'), draft: get('draft') };
}

// Word-wrap a title into lines that fit the OG canvas at the given font size.
function wrap(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4); // cap at 4 lines
}

function buildSvg(title, category) {
  const lines = wrap(title, 26);
  const fontSize = lines.length > 3 ? 44 : lines.length > 2 ? 52 : 60;
  const lineHeight = Math.round(fontSize * 1.2);
  const blockH = lines.length * lineHeight;
  const startY = 315 - blockH / 2 + fontSize * 0.8;
  const titleTspans = lines
    .map((ln, i) => `<text x="80" y="${Math.round(startY + i * lineHeight)}" font-family="-apple-system, 'SF Pro Display', Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#e4e4e7">${esc(ln)}</text>`)
    .join('\n  ');
  const cat = category || 'article';
  const catW = Math.max(90, cat.length * 11 + 40);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f2a2b"/>
      <stop offset="1" stop-color="#1a3435"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="6" fill="#ff6643"/>
  <rect x="80" y="70" width="${catW}" height="40" rx="20" fill="#234044"/>
  <text x="100" y="96" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="20" fill="#a1a1aa">${esc(cat)}</text>
  ${titleTspans}
  <text x="80" y="555" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="28" font-weight="600" fill="#ff8569">Nikita Boyarkin</text>
  <text x="80" y="588" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="20" fill="#71717a">Data / Product Analyst</text>
  <rect x="80" y="525" width="120" height="3" fill="#ff6643"/>
</svg>`;
}

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
let made = 0;
const errors = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const text = readFileSync(join(POSTS_DIR, file), 'utf8');
  const fm = parseFrontmatter(text);
  if (fm.draft === 'true') continue;
  if (!fm.title) { errors.push(`${slug}: no title`); continue; }
  const svg = buildSvg(fm.title, fm.category);
  const svgPath = join(tmpdir(), `og-${slug}.svg`);
  const pngPath = join(OUT_DIR, `${slug}.png`);
  writeFileSync(svgPath, svg);
  const res = spawnSync('rsvg-convert', [svgPath, '-o', pngPath], { encoding: 'utf8' });
  if (res.status !== 0) {
    errors.push(`${slug}: rsvg-convert failed: ${res.stderr || res.stdout}`);
  } else {
    made++;
    console.log(`  OK  ${slug}.png`);
  }
  try { unlinkSync(svgPath); } catch {}
}

console.log(`\nGenerated ${made} OG image(s) → public/images/og/`);
if (errors.length) {
  console.error('Errors:\n' + errors.map((e) => '  ' + e).join('\n'));
  process.exit(1);
}