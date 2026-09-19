// A4 cover page for the CV PDF (cv-cover.pdf).
//
// The CV download (nikitaboyarkin.github.io/CV-Nikita-Boyarkin.pdf) is a plain
// one-page A4 resume, so link previews render a dense wall of text. This cover
// is prepended as page 1 by scripts/sync-cv-pdf.mjs, giving LinkedIn /
// Telegram / Slack a branded first page to show.
//
// Same identity as generate-cv-og.mjs / generate-cv-linkedin.mjs, laid out for
// A4 portrait (595.276 x 841.89 pt — SVG user units map 1:1 to pt here).
//
// The portrait is downscaled with sharp before embedding: cairo stores the
// bitmap Flate-compressed, so shipping the raw 1229x1469 source would inflate
// the PDF past 1 MB. The hexagon shows ~264 pt of height, so the default
// 700 px lands near 190 dpi — COVER_PHOTO_H tunes the trade-off.
//
// Palette: #1400c3 60% · #fe4e02 30% · #f8f2da 10%.
//
// Run: bun run og:cv:cover
// Not wired into the build — run manually; commit the PDF.

import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import sharp from 'sharp';

import {
  FONT_SANS,
  FONT_SERIF,
  assertContrast,
  esc,
  renderSvgToPdf,
} from './lib/og-render.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'public/images/og/cv-cover.pdf');
const PORTRAIT = join(ROOT, 'public/images/00_profile.jpg');

// A4 in points.
const W = 595.276;
const H = 841.89;
const CX = W / 2;

// Palette
const BLUE = '#1400c3';
const ORANGE = '#fe4e02';
const CREAM = '#f8f2da';

// AA gate: every text token clears 4.5:1 (3:1 for large text).
assertContrast(
  BLUE,
  [
    { name: 'name', color: CREAM, size: 56, weight: 600 },
    { name: 'role', color: CREAM, size: 23, weight: 600 },
    { name: 'chip', color: CREAM, size: 15, weight: 700 },
    { name: 'stat value', color: ORANGE, size: 26, weight: 700 },
    { name: 'stat label', color: CREAM, size: 14, weight: 500 },
    { name: 'caption', color: CREAM, size: 13, weight: 500 },
    { name: 'url', color: CREAM, size: 13, weight: 500 },
    { name: 'logo', color: CREAM, size: 27, weight: 700 },
    { name: 'graphic: orange rules/ring (orange)', color: ORANGE, decorative: true },
  ],
  'CV cover',
);

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

// Portrait: cream tile R=132, photo clip R=125, orange ring R=128.5.
const PC = { cx: CX, cy: 415, r: 132 };
const HEX_TILE = hex(PC.cx, PC.cy, PC.r);
const HEX_PHOTO = hex(PC.cx, PC.cy, PC.r - 7);
const HEX_RING = hex(PC.cx, PC.cy, PC.r - 3.5);

// Image box is oversized vs the clip so the photo's hard shoulder edge never
// reaches the hexagon border (same trick as generate-home-og.mjs).
const IMG_X = PC.cx - 135;
const IMG_Y = PC.cy - 195;
const IMG_W = 270;
const IMG_H = 400;

// Three headline outcomes lifted from the CV, as centred mixed-colour lines.
// Spacing around the separator is set with dx, not literal spaces: SVG
// collapses whitespace, which would jam the middot against the adjacent spans.
const STATS = [
  { value: '+5.72 п.п.', label: 'A/B-тест KYC-конверсии' },
  { value: '€656K', label: 'доп. дохода в год' },
  { value: '+9.2 п.п.', label: 'retention к 3-му месяцу' },
];

const stats = STATS.map(
  (s, i) =>
    `<text x="${CX.toFixed(1)}" y="${(628 + i * 38).toFixed(1)}" font-family="${FONT_SANS}" text-anchor="middle"><tspan font-size="26" font-weight="700" letter-spacing="-0.5" fill="${ORANGE}">${esc(s.value)}</tspan><tspan font-size="18" fill="${ORANGE}" dx="7">·</tspan><tspan font-size="14" font-weight="500" fill="${CREAM}" dx="7">${esc(s.label)}</tspan></text>`,
).join('\n  ');

function buildSvg(portraitData) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}pt" height="${H}pt" viewBox="0 0 ${W} ${H}" text-rendering="geometricPrecision">
  <defs>
    <clipPath id="hexPhoto">
      <polygon points="${HEX_PHOTO}"/>
    </clipPath>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${ORANGE}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${ORANGE}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${BLUE}"/>
  <rect x="0" y="0" width="${W}" height="5" fill="${ORANGE}"/>

  <!-- decorative hexagons (subtle) -->
  <g fill="none" stroke="${CREAM}" stroke-width="1.5" opacity="0.12">
    <polygon points="120,300 152,318.5 152,355.5 120,374 88,355.5 88,318.5"/>
    <polygon points="476,300 508,318.5 508,355.5 476,374 444,355.5 444,318.5"/>
  </g>

  <!-- warm glow behind the portrait -->
  <ellipse cx="${CX.toFixed(1)}" cy="${PC.cy}" rx="210" ry="200" fill="url(#glow)"/>

  <!-- hexagon logo (matches nav logo geometry) -->
  <g transform="translate(26,24) scale(0.9)">
    <polygon points="96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2" fill="none" stroke="${ORANGE}" stroke-width="4"/>
    <text x="50" y="61" font-family="${FONT_SANS}" font-size="30" font-weight="700" fill="${CREAM}" text-anchor="middle">NB</text>
  </g>

  <text x="${CX.toFixed(1)}" y="150" font-family="${FONT_SERIF}" font-size="56" font-weight="600" letter-spacing="-1" fill="${CREAM}" text-anchor="middle">${esc('Nikita Boyarkin')}</text>
  <text x="${CX.toFixed(1)}" y="190" font-family="${FONT_SANS}" font-size="23" font-weight="600" fill="${CREAM}" text-anchor="middle">${esc('Product / Data Analyst')}</text>

  <!-- CV · PDF chip -->
  <rect x="${(CX - 58).toFixed(1)}" y="206" width="116" height="32" rx="16" fill="none" stroke="${ORANGE}" stroke-width="1.8"/>
  <text x="${CX.toFixed(1)}" y="228" font-family="${FONT_SANS}" font-size="15" font-weight="700" letter-spacing="2" fill="${CREAM}" text-anchor="middle">CV · PDF</text>

  <rect x="${(CX - 32).toFixed(1)}" y="258" width="64" height="2.5" fill="${ORANGE}"/>

  <!-- portrait: cream tile + clipped photo + orange ring -->
  <polygon points="${HEX_TILE}" fill="${CREAM}"/>
  <image x="${IMG_X.toFixed(1)}" y="${IMG_Y}" width="${IMG_W}" height="${IMG_H}" preserveAspectRatio="xMidYMid slice" clip-path="url(#hexPhoto)" xlink:href="${portraitData}" href="${portraitData}"/>
  <polygon points="${HEX_RING}" fill="none" stroke="${ORANGE}" stroke-width="5"/>

  <!-- headline scorecard -->
  <g>
  ${stats}
  </g>

  <text x="${CX.toFixed(1)}" y="760" font-family="${FONT_SANS}" font-size="13" font-weight="500" fill="${CREAM}" text-anchor="middle">${esc('Резюме · 2026')}</text>

  <rect x="${(CX - 30).toFixed(1)}" y="780" width="60" height="2.5" fill="${ORANGE}"/>
  <text x="${CX.toFixed(1)}" y="806" font-family="${FONT_SANS}" font-size="13" font-weight="500" fill="${CREAM}" text-anchor="middle">nikitaboyarkin.github.io</text>
</svg>`;
}

/** Downscaled portrait as a data URI — keeps the PDF lean (see header). */
async function portraitDataUri() {
  const height = Number(process.env.COVER_PHOTO_H ?? 700);
  const buf = await sharp(PORTRAIT)
    .resize({ height, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

/**
 * Render the A4 cover to `outPath` (defaults to public/images/og/cv-cover.pdf).
 * Exported so sync-cv-pdf.mjs can prepend a fresh cover in the same run.
 */
export async function renderCvCover(outPath = OUT) {
  renderSvgToPdf(buildSvg(await portraitDataUri()), outPath, { tmpName: 'cv-cover' });
  return outPath;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  console.log(`OK ${await renderCvCover()}`);
}
