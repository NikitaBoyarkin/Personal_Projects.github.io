// Homepage branded OG banner generator (portfolio-banner-v2.png).
// Renders a 1200x630 branded SVG (hexagon-clipped portrait + retention
// step curve) and converts it to PNG via rsvg-convert into
// public/images/og/portfolio-banner-v2.png.
// Palette: #1400c3 60% · #fe4e02 30% · #f8f2da 10%.
//
// Fonts: the identity name is Cormorant, all service text is Inter — the same
// families the site ships. They are vendored as static TTF in scripts/og-fonts/
// and resolved through FONTCONFIG_FILE + PANGOCAIRO_BACKEND=fc (see
// scripts/lib/og-render.mjs for why the second var is required on macOS).
// Requires `rsvg-convert` (librsvg 2.62.3) on PATH.
//
// Run: bun run og:home
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
const OUT = join(ROOT, 'public/images/og/portfolio-banner-v2.png');
const PORTRAIT = join(ROOT, 'public/images/00_profile.jpg');

// Palette
const BLUE = '#1400c3';
const ORANGE = '#fe4e02';
const CREAM = '#f8f2da';

// AA gate (REQ-03 / REQ-08): every text token clears 4.5:1 (3:1 for large).
assertContrast(
  BLUE,
  [
    { name: 'name', color: CREAM, size: 74, weight: 600 },
    { name: 'role', color: CREAM, size: 38, weight: 600 },
    { name: 'tagline', color: CREAM, size: 27, weight: 500 },
    { name: 'logo', color: CREAM, size: 30, weight: 700 },
    { name: 'chart axes', color: CREAM, size: 19, weight: 500 },
    { name: 'url', color: CREAM, size: 24, weight: 500 },
    { name: 'graphic:orange ring/curve (orange)', color: ORANGE, decorative: true },
  ],
  'home OG banner',
);

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
  <text x="138" y="${(gy + 6).toFixed(1)}" font-family="${FONT_SANS}" font-size="19" font-weight="500" fill="${CREAM}" text-anchor="end">${v}%</text>`;
    })
    .join('\n  ');

  const xLabels = values
    .map(
      (_, i) =>
        `<text x="${(x0 + i * seg).toFixed(1)}" y="549" font-family="${FONT_SANS}" font-size="19" font-weight="500" fill="${CREAM}" text-anchor="middle">W${i}</text>`,
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
    <!-- same surface language as the graph banner: rounded clipped panel,
         cream frame at 0.14, inner vignette, warm glow <= 0.08 -->
    <clipPath id="chartPanel">
      <rect x="88" y="396" width="540" height="170" rx="18"/>
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
    <polygon points="620,110 663,135 663,185 620,210 577,185 577,135"/>
    <polygon points="700,470 743,495 743,545 700,570 657,545 657,495"/>
  </g>

  <!-- retention chart surface: glow + vignette + frame, matching the graph banner -->
  <ellipse cx="358" cy="481" rx="270" ry="85" fill="url(#glow)"/>
  <rect x="88" y="396" width="540" height="170" rx="18" fill="url(#vignette)"/>

  <!-- cohort retention step curve with axis labels -->
  <g clip-path="url(#chartPanel)">
    ${STEP}
  </g>
  <rect x="88.5" y="396.5" width="539" height="169" rx="18" fill="none" stroke="${CREAM}" stroke-opacity="0.14" stroke-width="1"/>

  <!-- portrait: cream tile + clipped photo + orange ring -->
  <polygon points="${HEX_TILE}" fill="${CREAM}"/>
  <image x="830" y="20" width="390" height="600" preserveAspectRatio="xMidYMid slice" clip-path="url(#hexPhoto)" xlink:href="${portraitData}" href="${portraitData}"/>
  <polygon points="${HEX_RING}" fill="none" stroke="${ORANGE}" stroke-width="7"/>

  <!-- hexagon logo (matches nav logo geometry) -->
  <g transform="translate(80,40) scale(1.4)">
    <polygon points="96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2" fill="none" stroke="${ORANGE}" stroke-width="4"/>
    <text x="50" y="61" font-family="${FONT_SANS}" font-size="30" font-weight="700" fill="${CREAM}" text-anchor="middle">NB</text>
  </g>

  <text x="80" y="264" font-family="${FONT_SERIF}" font-size="74" font-weight="600" letter-spacing="-1" fill="${CREAM}">${esc('Nikita Boyarkin')}</text>
  <text x="80" y="328" font-family="${FONT_SANS}" font-size="38" font-weight="600" fill="${CREAM}">${esc('Product / Data Analyst')}</text>
  <text x="80" y="384" font-family="${FONT_SANS}" font-size="27" font-weight="500" fill="${CREAM}">${esc('Данные → решения. От гипотезы до ship-gate.')}</text>

  <rect x="80" y="578" width="120" height="3" fill="${ORANGE}"/>
  <text x="80" y="610" font-family="${FONT_SANS}" font-size="24" font-weight="500" fill="${CREAM}">nikitaboyarkin.github.io</text>
</svg>`;

renderSvgToPng(svg, OUT, { tmpName: 'og-home' });
console.log(`OK ${OUT}`);
