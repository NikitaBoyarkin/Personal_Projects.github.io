// CV / résumé link banner generator (cv-banner.png, 1200x630).
// Shares the identity + surface language of generate-home-og.mjs and
// generate-graph-og.mjs: hexagon NB lockup, hexagon-clipped portrait,
// Cormorant for the name and Inter for every service token.
//
// Purpose: a shareable preview card for the CV PDF link
// (nikitaboyarkin.github.io/CV-Nikita-Boyarkin.pdf) — used as og:image on
// CV-linked pages and as the attached preview when the PDF is posted.
//
// Palette: #1400c3 60% · #fe4e02 30% · #f8f2da 10%.
//
// Run: bun run og:cv
// Not wired into the build — run manually; commit the PNG.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  FONT_SANS,
  FONT_SERIF,
  assertContrast,
  esc,
  renderSvgToPng,
} from './lib/og-render.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'public/images/og/cv-banner.png');
const PORTRAIT = join(ROOT, 'public/images/00_profile.jpg');

// Palette
const BLUE = '#1400c3';
const ORANGE = '#fe4e02';
const CREAM = '#f8f2da';

// AA gate: every text token clears 4.5:1 (3:1 for large text).
assertContrast(
  BLUE,
  [
    { name: 'name', color: CREAM, size: 66, weight: 600 },
    { name: 'role', color: CREAM, size: 34, weight: 600 },
    { name: 'chip', color: CREAM, size: 20, weight: 700 },
    { name: 'stat value', color: ORANGE, size: 44, weight: 700 },
    { name: 'stat label', color: CREAM, size: 18, weight: 500 },
    { name: 'url', color: CREAM, size: 22, weight: 500 },
    { name: 'logo', color: CREAM, size: 30, weight: 700 },
    { name: 'graphic:orange rules/ring (orange)', color: ORANGE, decorative: true },
  ],
  'CV OG banner',
);

// Portrait inlined as a data URI so rsvg-convert resolves it from any cwd.
const portraitData = `data:image/jpeg;base64,${readFileSync(PORTRAIT).toString('base64')}`;

// Three headline outcomes lifted from the CV. Values are orange (accent),
// labels cream — the pair reads as an analytics scorecard, not a bio.
const STATS = [
  { value: '+5.72 п.п.', label: 'A/B-тест KYC-конверсии' },
  { value: '€656K', label: 'доп. дохода в год' },
  { value: '+9.2 п.п.', label: 'retention к 3-му месяцу' },
];

const PANEL_X = 62;
const PANEL_Y = 364;
const PANEL_W = 560;
const PANEL_H = 196;
const ROW_TOP = 414;
const ROW_STEP = 60;

const rows = STATS.map((s, i) => {
  const y = ROW_TOP + i * ROW_STEP;
  const sep =
    i < STATS.length - 1
      ? `<line x1="98" y1="${y + 30}" x2="584" y2="${y + 30}" stroke="${CREAM}" stroke-width="1" opacity="0.14"/>`
      : '';
  return `<text x="98" y="${y}" font-family="${FONT_SANS}" font-size="34" font-weight="700" letter-spacing="-0.5" fill="${ORANGE}">${esc(s.value)}</text>
    <text x="300" y="${y + 8}" font-family="${FONT_SANS}" font-size="18" font-weight="500" fill="${CREAM}">${esc(s.label)}</text>
    ${sep}`;
}).join('\n    ');

// Pointy-top hexagons centred at (975,305): cream tile R=232, photo clip R=225,
// orange ring R=228.5 (stroke 7 — exactly covers the 225..232 band).
const HEX_TILE = '975,73 1175.9,189 1175.9,421 975,537 774.1,421 774.1,189';
const HEX_PHOTO = '975,80 1169.9,192.5 1169.9,417.5 975,530 780.1,417.5 780.1,192.5';
const HEX_RING = '975,76.5 1172.9,190.8 1172.9,419.3 975,533.5 777.1,419.3 777.1,190.8';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630" text-rendering="geometricPrecision">
  <defs>
    <clipPath id="hexPhoto">
      <polygon points="${HEX_PHOTO}"/>
    </clipPath>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${ORANGE}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${ORANGE}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.25"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${BLUE}"/>
  <rect x="0" y="0" width="1200" height="6" fill="${ORANGE}"/>

  <!-- decorative hexagons (subtle) -->
  <g fill="none" stroke="${CREAM}" stroke-width="2" opacity="0.12">
    <polygon points="636,120 679,145 679,195 636,220 593,195 593,145"/>
    <polygon points="690,500 733,525 733,575 690,600 647,575 647,525"/>
  </g>

  <!-- warm glow under the scorecard -->
  <ellipse cx="360" cy="462" rx="300" ry="90" fill="url(#glow)"/>
  <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" rx="18" fill="url(#vignette)"/>

  <!-- headline scorecard -->
  <g>
    ${rows}
  </g>
  <rect x="${PANEL_X + 0.5}" y="${PANEL_Y + 0.5}" width="${PANEL_W - 1}" height="${PANEL_H - 1}" rx="18" fill="none" stroke="${CREAM}" stroke-opacity="0.14" stroke-width="1"/>

  <!-- hexagon logo (matches nav logo geometry) -->
  <g transform="translate(80,40) scale(1.4)">
    <polygon points="96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2" fill="none" stroke="${ORANGE}" stroke-width="4"/>
    <text x="50" y="61" font-family="${FONT_SANS}" font-size="30" font-weight="700" fill="${CREAM}" text-anchor="middle">NB</text>
  </g>

  <text x="80" y="238" font-family="${FONT_SERIF}" font-size="66" font-weight="600" letter-spacing="-1" fill="${CREAM}">${esc('Nikita Boyarkin')}</text>
  <text x="80" y="292" font-family="${FONT_SANS}" font-size="34" font-weight="600" fill="${CREAM}">${esc('Product / Data Analyst')}</text>

  <!-- CV · PDF chip -->
  <rect x="80" y="312" width="150" height="36" rx="18" fill="none" stroke="${ORANGE}" stroke-width="2"/>
  <text x="155" y="336" font-family="${FONT_SANS}" font-size="20" font-weight="700" letter-spacing="2" fill="${CREAM}" text-anchor="middle">CV · PDF</text>

  <!-- portrait: cream tile + clipped photo + orange ring -->
  <polygon points="${HEX_TILE}" fill="${CREAM}"/>
  <image x="830" y="20" width="390" height="600" preserveAspectRatio="xMidYMid slice" clip-path="url(#hexPhoto)" xlink:href="${portraitData}" href="${portraitData}"/>
  <polygon points="${HEX_RING}" fill="none" stroke="${ORANGE}" stroke-width="7"/>

  <rect x="80" y="578" width="120" height="3" fill="${ORANGE}"/>
  <text x="80" y="610" font-family="${FONT_SANS}" font-size="22" font-weight="500" fill="${CREAM}">nikitaboyarkin.github.io</text>
</svg>`;

renderSvgToPng(svg, OUT, { tmpName: 'og-cv' });
console.log(`OK ${OUT}`);
