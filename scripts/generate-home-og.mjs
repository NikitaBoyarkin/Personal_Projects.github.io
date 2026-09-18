// Homepage branded OG banner generator.
// Renders a 1200x630 branded SVG (hexagon-clipped portrait + retention
// step curve) and converts it to PNG via rsvg-convert into
// public/images/og/portfolio-banner-v2.png.
// Palette: #1400c3 60% · #fe4e02 30% · #f8f2da 10%.
// Run: bun run og:home
// Not wired into the build — run manually; commit the PNG.

import { writeFileSync, readFileSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = join(ROOT, 'public/images/og');
const OUT = join(OUT_DIR, 'portfolio-banner-v2.png');
const PORTRAIT = join(ROOT, 'public/images/00_profile.jpg');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Palette
const BLUE = '#1400c3';
const ORANGE = '#fe4e02';
const CREAM = '#f8f2da';

// rsvg uses fontconfig, which does not know `-apple-system`; name a font that
// actually exists so the banner does not silently fall back to a default sans.
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// Portrait inlined as a data URI so rsvg-convert resolves it from any cwd.
const portraitData = `data:image/jpeg;base64,${readFileSync(PORTRAIT).toString('base64')}`;

// Cohort retention step curve with axis labels — reads as a real retention
// chart on larger previews. Every label is drawn in cream (#f8f2da).
const STEP = (() => {
  const x0 = 150;
  const x1 = 600;
  const yTop = 408;
  const yBottom = 518;
  const values = [100, 68, 52, 43, 38, 35, 33];
  const seg = (x1 - x0) / (values.length - 1);
  const y = (v) => yBottom - (v / 100) * (yBottom - yTop);

  let d = `M${x0},${y(values[0]).toFixed(1)}`;
  for (let i = 1; i < values.length; i++) {
    d += ` H${(x0 + i * seg).toFixed(1)} V${y(values[i]).toFixed(1)}`;
  }
  d += ` H${x1}`;

  const grid = [100, 75, 50, 25, 0]
    .map((v) => {
      const gy = y(v);
      return `<line x1="${x0}" y1="${gy.toFixed(1)}" x2="${x1}" y2="${gy.toFixed(1)}" stroke="${CREAM}" stroke-width="1" opacity="0.14"/>
  <text x="138" y="${(gy + 6).toFixed(1)}" font-family="${FONT}" font-size="19" font-weight="500" fill="${CREAM}" text-anchor="end">${v}%</text>`;
    })
    .join('\n  ');

  const xLabels = values
    .map(
      (_, i) =>
        `<text x="${(x0 + i * seg).toFixed(1)}" y="549" font-family="${FONT}" font-size="19" font-weight="500" fill="${CREAM}" text-anchor="middle">W${i}</text>`,
    )
    .join('\n  ');

  const nodes = values
    .slice(1)
    .map(
      (v, i) =>
        `<circle cx="${(x0 + (i + 1) * seg).toFixed(1)}" cy="${y(v).toFixed(1)}" r="5.5" fill="${CREAM}"/>`,
    )
    .join('\n  ');

  return `${grid}
  <path d="${d} V${yBottom} H${x0} Z" fill="${ORANGE}" opacity="0.12"/>
  <path d="${d}" fill="none" stroke="${ORANGE}" stroke-width="4" stroke-linejoin="round"/>
  ${nodes}
  ${xLabels}`;
})();

// Pointy-top hexagons centred at (975,305): cream tile R=232, photo clip R=225,
// orange ring R=228.5 (stroke 7 — exactly covers the 225..232 band).
const HEX_TILE = '975,73 1175.9,189 1175.9,421 975,537 774.1,421 774.1,189';
const HEX_PHOTO = '975,80 1169.9,192.5 1169.9,417.5 975,530 780.1,417.5 780.1,192.5';
const HEX_RING = '975,76.5 1172.9,190.8 1172.9,419.3 975,533.5 777.1,419.3 777.1,190.8';

// The portrait box is deliberately oversized (390x600) so the source photo's
// hard-cut shoulder edge is pushed below the hexagon and never shows.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630" text-rendering="geometricPrecision">
  <defs>
    <clipPath id="hexPhoto">
      <polygon points="${HEX_PHOTO}"/>
    </clipPath>
  </defs>

  <rect width="1200" height="630" fill="${BLUE}"/>
  <rect x="0" y="0" width="1200" height="6" fill="${ORANGE}"/>

  <!-- decorative hexagons (subtle) -->
  <g fill="none" stroke="${CREAM}" stroke-width="2" opacity="0.12">
    <polygon points="620,110 663,135 663,185 620,210 577,185 577,135"/>
    <polygon points="700,470 743,495 743,545 700,570 657,545 657,495"/>
  </g>

  <!-- portrait: cream tile + clipped photo + orange ring -->
  <polygon points="${HEX_TILE}" fill="${CREAM}"/>
  <image x="830" y="20" width="390" height="600" preserveAspectRatio="xMidYMid slice" clip-path="url(#hexPhoto)" xlink:href="${portraitData}" href="${portraitData}"/>
  <polygon points="${HEX_RING}" fill="none" stroke="${ORANGE}" stroke-width="7"/>

  <!-- hexagon logo (matches nav logo geometry) -->
  <g transform="translate(80,40) scale(1.4)">
    <polygon points="96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2" fill="none" stroke="${ORANGE}" stroke-width="4"/>
    <text x="50" y="61" font-family="${FONT}" font-size="30" font-weight="700" fill="${CREAM}" text-anchor="middle">NB</text>
  </g>

  <text x="80" y="262" font-family="${FONT}" font-size="74" font-weight="700" letter-spacing="-1.5" fill="${CREAM}">${esc('Nikita Boyarkin')}</text>
  <text x="80" y="330" font-family="${FONT}" font-size="38" font-weight="600" fill="${ORANGE}">${esc('Product / Data Analyst')}</text>
  <text x="80" y="382" font-family="${FONT}" font-size="27" font-weight="500" fill="${CREAM}">${esc('Данные → решения. От гипотезы до ship-gate.')}</text>

  <!-- cohort retention step curve with axis labels -->
  ${STEP}

  <rect x="80" y="566" width="120" height="3" fill="${ORANGE}"/>
  <text x="80" y="606" font-family="${FONT}" font-size="24" font-weight="500" fill="${CREAM}">nikitaboyarkin.github.io</text>
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
