// Homepage branded OG banner generator.
// Renders a 1200x630 branded SVG for the portfolio homepage and converts it
// to PNG via rsvg-convert into public/images/og/portfolio-banner.png.
// Run: npm run og:home
// Not wired into the build — run manually; commit the PNG.

import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = join(ROOT, 'public/images/og');
const OUT = join(OUT_DIR, 'portfolio-banner.png');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SKILLS = ['SQL', 'Python', 'A/B Testing', 'Retention', 'Segmentation'];

// Skill pills — laid out left-to-right from x=80.
let pillX = 80;
const pillY = 470;
const pillH = 44;
const pillGap = 16;
const pills = SKILLS.map((s) => {
  const w = Math.round(s.length * 13 + 36); // ~13px/char at 22px font + padding
  const pill = `<rect x="${pillX}" y="${pillY}" width="${w}" height="${pillH}" rx="22" fill="#234044"/>
  <text x="${pillX + w / 2}" y="${pillY + 29}" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="22" fill="#e4e4e7" text-anchor="middle">${esc(s)}</text>`;
  pillX += w + pillGap;
  return pill;
}).join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f2a2b"/>
      <stop offset="1" stop-color="#1a3435"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="6" fill="#ff6643"/>

  <!-- decorative hexagons (subtle) -->
  <g fill="none" stroke="#234044" stroke-width="2">
    <polygon points="1050,120 1093,145 1093,195 1050,220 1007,195 1007,145" opacity="0.6"/>
    <polygon points="1120,300 1163,325 1163,375 1120,400 1077,375 1077,325" opacity="0.4"/>
    <polygon points="1000,480 1043,505 1043,555 1000,580 957,555 957,505" opacity="0.3"/>
  </g>

  <!-- hexagon logo (matches nav logo geometry, scaled 1.6x) -->
  <g transform="translate(80,40) scale(1.6)">
    <polygon points="96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2" fill="none" stroke="#ff8569" stroke-width="4"/>
    <text x="50" y="61" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#e4e4e7" text-anchor="middle">NB</text>
  </g>

  <text x="80" y="250" font-family="-apple-system, 'SF Pro Display', Helvetica, Arial, sans-serif" font-size="76" font-weight="700" fill="#e4e4e7">Nikita Boyarkin</text>
  <text x="80" y="330" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="44" font-weight="600" fill="#ff8569">Data Analyst / Product Analyst</text>
  <text x="80" y="400" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="30" fill="#a1a1aa">Данные → решения. От гипотезы до ship-gate.</text>

  ${pills}

  <rect x="80" y="545" width="120" height="3" fill="#ff6643"/>
  <text x="80" y="590" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="24" fill="#71717a">nikitaboyarkin.github.io</text>
</svg>`;

const svgPath = join(tmpdir(), 'og-home.svg');
writeFileSync(svgPath, svg);
const res = spawnSync('rsvg-convert', [svgPath, '-o', OUT], { encoding: 'utf8' });
try { unlinkSync(svgPath); } catch {}
if (res.status !== 0) {
  console.error('rsvg-convert failed:', res.stderr || res.stdout);
  process.exit(1);
}
console.log(`OK ${OUT}`);
