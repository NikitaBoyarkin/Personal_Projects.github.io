// LinkedIn feed variant of the CV banner (cv-linkedin.png, 1200x627).
//
// Same identity as generate-cv-og.mjs, retuned for LinkedIn's feed:
//  - 1200x627 (LinkedIn's 1.91:1 landscape spec, no auto-crop);
//  - larger type and a wider scorecard, because the feed renders the image
//    at roughly half width;
//  - a slightly smaller portrait so the left column gets the room.
//
// Palette: #1400c3 60% · #fe4e02 30% · #f8f2da 10%.
//
// Run: bun run og:cv:li
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
const OUT = join(ROOT, 'public/images/og/cv-linkedin.png');
const PORTRAIT = join(ROOT, 'public/images/00_profile.jpg');

// Palette
const BLUE = '#1400c3';
const ORANGE = '#fe4e02';
const CREAM = '#f8f2da';

// AA gate: every text token clears 4.5:1 (3:1 for large text).
assertContrast(
  BLUE,
  [
    { name: 'name', color: CREAM, size: 70, weight: 600 },
    { name: 'role', color: CREAM, size: 36, weight: 600 },
    { name: 'chip', color: CREAM, size: 20, weight: 700 },
    { name: 'stat value', color: ORANGE, size: 40, weight: 700 },
    { name: 'stat label', color: CREAM, size: 20, weight: 500 },
    { name: 'url', color: CREAM, size: 22, weight: 500 },
    { name: 'logo', color: CREAM, size: 30, weight: 700 },
    { name: 'graphic: orange rules/ring (orange)', color: ORANGE, decorative: true },
  ],
  'CV LinkedIn banner',
);

// Portrait inlined as a data URI so rsvg-convert resolves it from any cwd.
const portraitData = `data:image/jpeg;base64,${readFileSync(PORTRAIT).toString('base64')}`;

// Pointy-top hexagon vertices for a given centre + circumradius.
const hex = (cx, cy, r) => {
  const dx = (r * Math.sqrt(3)) / 2;
  return [
    [cx, cy - r],
    [cx + dx, cy - r / 2],
    [cx + dx, cy + r / 2],
    [cx, cy + r],
    [cx - dx, cy + r / 2],
    [cx - dx, cy - r / 2],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
};

// Portrait: cream tile R=200, photo clip R=193, orange ring R=196.5.
const PC = { cx: 1000, cy: 305, r: 200 };
const HEX_TILE = hex(PC.cx, PC.cy, PC.r);
const HEX_PHOTO = hex(PC.cx, PC.cy, PC.r - 7);
const HEX_RING = hex(PC.cx, PC.cy, PC.r - 3.5);

// Three headline outcomes lifted from the CV. Values are orange (accent),
// labels cream — the pair reads as an analytics scorecard, not a bio.
const STATS = [
  { value: '+5.72 п.п.', label: 'A/B-тест KYC-конверсии' },
  { value: '€656K', label: 'доп. дохода в год' },
  { value: '+9.2 п.п.', label: 'retention к 3-му месяцу' },
];

const PANEL_X = 62;
const PANEL_Y = 366;
const PANEL_W = 700;
const PANEL_H = 192;
const ROW_TOP = 418;
const ROW_STEP = 62;

const rows = STATS.map((s, i) => {
  const y = ROW_TOP + i * ROW_STEP;
  const sep =
    i < STATS.length - 1
      ? `<line x1="98" y1="${y + 30}" x2="${PANEL_X + PANEL_W - 38}" y2="${y + 30}" stroke="${CREAM}" stroke-width="1" opacity="0.14"/>`
      : '';
  return `<text x="98" y="${y}" font-family="${FONT_SANS}" font-size="40" font-weight="700" letter-spacing="-0.5" fill="${ORANGE}">${esc(s.value)}</text>
    <text x="340" y="${y + 8}" font-family="${FONT_SANS}" font-size="20" font-weight="500" fill="${CREAM}">${esc(s.label)}</text>
    ${sep}`;
}).join('\n    ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="627" viewBox="0 0 1200 627" text-rendering="geometricPrecision">
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

  <rect width="1200" height="627" fill="${BLUE}"/>
  <rect x="0" y="0" width="1200" height="6" fill="${ORANGE}"/>

  <!-- decorative hexagon (subtle) -->
  <g fill="none" stroke="${CREAM}" stroke-width="2" opacity="0.12">
    <polygon points="700,110 743,135 743,185 700,210 657,185 657,135"/>
  </g>

  <!-- warm glow under the scorecard -->
  <ellipse cx="400" cy="462" rx="340" ry="95" fill="url(#glow)"/>
  <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" rx="18" fill="url(#vignette)"/>

  <!-- headline scorecard -->
  <g>
    ${rows}
  </g>
  <rect x="${PANEL_X + 0.5}" y="${PANEL_Y + 0.5}" width="${PANEL_W - 1}" height="${PANEL_H - 1}" rx="18" fill="none" stroke="${CREAM}" stroke-opacity="0.14" stroke-width="1"/>

  <!-- hexagon logo (matches nav logo geometry) -->
  <g transform="translate(80,36) scale(1.3)">
    <polygon points="96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2" fill="none" stroke="${ORANGE}" stroke-width="4"/>
    <text x="50" y="61" font-family="${FONT_SANS}" font-size="30" font-weight="700" fill="${CREAM}" text-anchor="middle">NB</text>
  </g>

  <text x="80" y="240" font-family="${FONT_SERIF}" font-size="70" font-weight="600" letter-spacing="-1" fill="${CREAM}">${esc('Nikita Boyarkin')}</text>
  <text x="80" y="294" font-family="${FONT_SANS}" font-size="36" font-weight="600" fill="${CREAM}">${esc('Product / Data Analyst')}</text>

  <!-- CV · PDF chip -->
  <rect x="80" y="312" width="150" height="36" rx="18" fill="none" stroke="${ORANGE}" stroke-width="2"/>
  <text x="155" y="336" font-family="${FONT_SANS}" font-size="20" font-weight="700" letter-spacing="2" fill="${CREAM}" text-anchor="middle">CV · PDF</text>

  <!-- portrait: cream tile + clipped photo + orange ring -->
  <polygon points="${HEX_TILE}" fill="${CREAM}"/>
  <image x="830" y="20" width="390" height="600" preserveAspectRatio="xMidYMid slice" clip-path="url(#hexPhoto)" xlink:href="${portraitData}" href="${portraitData}"/>
  <polygon points="${HEX_RING}" fill="none" stroke="${ORANGE}" stroke-width="6"/>

  <rect x="80" y="576" width="120" height="3" fill="${ORANGE}"/>
  <text x="80" y="608" font-family="${FONT_SANS}" font-size="22" font-weight="500" fill="${CREAM}">nikitaboyarkin.github.io</text>
</svg>`;

renderSvgToPng(svg, OUT, { tmpName: 'og-cv-linkedin' });
console.log(`OK ${OUT}`);
