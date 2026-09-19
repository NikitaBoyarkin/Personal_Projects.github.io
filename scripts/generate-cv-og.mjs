// CV / résumé link banner generator (cv-banner.png, 1200x630).
// Shares the identity + surface language of generate-home-og.mjs and
// generate-graph-og.mjs: hexagon NB lockup, hexagon-clipped portrait,
// Cormorant for the name and Inter for every service token.
//
// Purpose: a shareable preview card for the CV PDF link
// (nikitaboyarkin.github.io/CV-Nikita-Boyarkin.pdf) — used as og:image on
// CV-linked pages and as the attached preview when the PDF is posted.
//
// Palette: brand blue surface · orange accent · unified cream ink — all from
// src/lib/brand.ts, so this script holds no brand hex of its own.
//
// Run: bun run og:cv
// Not wired into the build — run manually; commit the PNG.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ACCENT_ON_BLUE,
  BRAND_BLUE,
  CREAM,
  SURFACE_BLUE_DEEP,
  SURFACE_BLUE_DEEPEST,
  hexPoints,
  hexPointsFlat,
} from '../src/lib/brand.ts';
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

// Palette — every value is the brand module's.
const BLUE = BRAND_BLUE;
const ORANGE = ACCENT_ON_BLUE;
const PANEL_BG = SURFACE_BLUE_DEEP; // lightest panel stop — the contrast floor

// Three headline outcomes lifted from the CV. Values are orange (accent),
// labels cream — the pair reads as an analytics scorecard, not a bio.
const STATS = [
  { value: '+5.72 п.п.', label: 'A/B-тест KYC-конверсии' },
  { value: '€656K', label: 'доп. дохода в год' },
  { value: '+9.2 п.п.', label: 'retention к 3-му месяцу' },
];

// --- Grid. One edge, one unit; every offset is EDGE + n * UNIT, so the whole
// card sits on a single rhythm instead of ad-hoc pixel values. ---
const W = 1200;
const H = 630;
const EDGE = 80;
const UNIT = 10;

const PANEL = { x: EDGE, y: 360, w: 540 };
const ROW_H = 58; // one constant drives every row step
const PANEL_PAD = 22;
const PANEL_H = STATS.length * ROW_H + 2 * PANEL_PAD;
const rowBandTop = (i) => PANEL.y + PANEL_PAD + i * ROW_H;
const rowBaseline = (i) => rowBandTop(i) + ROW_H / 2 + 12;
// Separators sit midway between row baselines, spanning the panel inset — a
// container-level rule, not a per-row afterthought.
const rowSeparator = (i) => rowBaseline(i) + ROW_H / 2;
const LABEL_X = PANEL.x + 24 * UNIT; // label column, aligned across rows

// Portrait — pointy-top hexagon, one geometry from brand.ts.
const PORTRAIT_C = { cx: 975, cy: 305 };
const TILE_R = 232; // plate radius
const PHOTO_R = TILE_R - 7; // photo clip
const RING_R = TILE_R - 3.5; // orange ring (stroke 7 covers PHOTO_R..TILE_R)
const GLOW_R = TILE_R; // warm halo hugs the ring; a stroked hexagon stays even

// NB brand mark — flat-top hexagon, geometry matches the nav logo, and the
// polygon's left vertex lands exactly on the text edge (EDGE).
const LOGO_R = 58;
const LOGO = { cx: EDGE + LOGO_R, cy: 92 };

// AA gate: every text token clears 4.5:1 (3:1 for large text). Tokens on the
// deep scorecard panel are asserted against the panel, not the page.
assertContrast(
  BLUE,
  [
    { name: 'name', color: CREAM, size: 66, weight: 600 },
    { name: 'role', color: CREAM, size: 34, weight: 600 },
    { name: 'chip', color: CREAM, size: 20, weight: 700 },
    { name: 'url', color: CREAM, size: 22, weight: 500 },
    { name: 'logo', color: CREAM, size: 30, weight: 700 },
    { name: 'graphic: rules/ring (orange)', color: ORANGE, decorative: true },
  ],
  'CV OG banner',
);
assertContrast(
  PANEL_BG,
  [
    { name: 'stat value (panel)', color: ORANGE, size: 34, weight: 700 },
    { name: 'stat label (panel)', color: CREAM, size: 18, weight: 500 },
  ],
  'CV OG scorecard',
);

// Portrait inlined as a data URI so rsvg-convert resolves it from any cwd.
const portraitData = `data:image/jpeg;base64,${readFileSync(PORTRAIT).toString('base64')}`;

const rows = STATS.map((s, i) => {
  const y = rowBaseline(i);
  const sep =
    i < STATS.length - 1
      ? `<line x1="${PANEL.x + PANEL_PAD}" y1="${rowSeparator(i)}" x2="${PANEL.x + PANEL.w - PANEL_PAD}" y2="${rowSeparator(i)}" stroke="${CREAM}" stroke-width="1" opacity="0.16"/>`
      : '';
  return `<text x="${PANEL.x + PANEL_PAD}" y="${y.toFixed(1)}" font-family="${FONT_SANS}" font-size="34" font-weight="700" letter-spacing="-0.5" fill="${ORANGE}">${esc(s.value)}</text>
    <text x="${LABEL_X}" y="${(y + 8).toFixed(1)}" font-family="${FONT_SANS}" font-size="18" font-weight="500" fill="${CREAM}">${esc(s.label)}</text>
    ${sep}`;
}).join('\n    ');

// Decorative hexagons on the gutter between the text column and the portrait,
// mirrored about the portrait's centre line so the field reads as placed, not
// sprinkled. Geometry from brand.ts; colour from the brand cream.
const DECOR_R = 42;
const decor = [
  [676, PORTRAIT_C.cy - 153],
  [676, PORTRAIT_C.cy + 153],
]
  .map(
    ([cx, cy]) =>
      `<polygon points="${hexPoints(cx, cy, DECOR_R)}" fill="none" stroke="${CREAM}" stroke-width="2" opacity="0.1"/>`,
  )
  .join('\n    ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" text-rendering="geometricPrecision">
  <defs>
    <clipPath id="hexPhoto">
      <polygon points="${hexPoints(PORTRAIT_C.cx, PORTRAIT_C.cy, PHOTO_R)}"/>
    </clipPath>
    <linearGradient id="surface" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BLUE}"/>
      <stop offset="0.55" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="${SURFACE_BLUE_DEEP}"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${SURFACE_BLUE_DEEP}"/>
      <stop offset="1" stop-color="${SURFACE_BLUE_DEEPEST}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#surface)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${ORANGE}"/>

  <!-- decorative hexagons on the gutter -->
  <g>
    ${decor}
  </g>

  <!-- deep scorecard well: gradient surface + cream hairline -->
  <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.w}" height="${PANEL_H}" rx="18" fill="url(#panel)"/>
  <g>
    ${rows}
  </g>
  <rect x="${PANEL.x + 0.5}" y="${PANEL.y + 0.5}" width="${PANEL.w - 1}" height="${PANEL_H - 1}" rx="18" fill="none" stroke="${CREAM}" stroke-opacity="0.16" stroke-width="1"/>

  <!-- NB brand mark (nav-logo geometry, left vertex flush with the text edge) -->
  <polygon points="${hexPointsFlat(LOGO.cx, LOGO.cy, LOGO_R)}" fill="none" stroke="${ORANGE}" stroke-width="4"/>
  <text x="${LOGO.cx}" y="${LOGO.cy + 11}" font-family="${FONT_SANS}" font-size="30" font-weight="700" fill="${CREAM}" text-anchor="middle">NB</text>

  <text x="${EDGE}" y="238" font-family="${FONT_SERIF}" font-size="66" font-weight="600" letter-spacing="-1" fill="${CREAM}">${esc('Nikita Boyarkin')}</text>
  <text x="${EDGE}" y="292" font-family="${FONT_SANS}" font-size="34" font-weight="600" fill="${CREAM}">${esc('Product / Data Analyst')}</text>

  <!-- CV · PDF chip -->
  <rect x="${EDGE}" y="312" width="150" height="36" rx="18" fill="none" stroke="${ORANGE}" stroke-width="2"/>
  <text x="${EDGE + 75}" y="336" font-family="${FONT_SANS}" font-size="20" font-weight="700" letter-spacing="2" fill="${CREAM}" text-anchor="middle">CV · PDF</text>

  <!-- portrait: warm halo + clipped photo + orange ring (no cream plate) -->
  <polygon points="${hexPoints(PORTRAIT_C.cx, PORTRAIT_C.cy, GLOW_R)}" fill="none" stroke="${ORANGE}" stroke-width="8" opacity="0.14"/>
  <image x="830" y="20" width="390" height="600" preserveAspectRatio="xMidYMid slice" clip-path="url(#hexPhoto)" xlink:href="${portraitData}" href="${portraitData}"/>
  <polygon points="${hexPoints(PORTRAIT_C.cx, PORTRAIT_C.cy, RING_R)}" fill="none" stroke="${ORANGE}" stroke-width="7"/>

  <text x="${EDGE}" y="610" font-family="${FONT_SANS}" font-size="22" font-weight="500" fill="${CREAM}">nikitaboyarkin.github.io</text>
</svg>`;

renderSvgToPng(svg, OUT, { tmpName: 'og-cv' });
console.log(`OK ${OUT}`);
