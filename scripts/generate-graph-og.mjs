// Homepage knowledge-graph OG banner generator.
// Renders a 1200x630 branded SVG whose right panel is the REAL content graph
// (same builder + build-time layout as /graph/ and /graph.json): left panel is
// the identity block, right panel the network. Converts it to PNG via
// rsvg-convert into public/images/og/portfolio-graph-v1.png.
//
// Single source of truth: imports buildGraph / layoutGraph / TOPICS and the
// shared visual tokens straight from src/lib, so the preview can never drift
// from the graph the site renders.
// Palette matches the homepage banner (portfolio-banner-v2.png):
// #1400c3 60% · #fe4e02 30% · #f8f2da 10%.
// Run: bun run og:graph
// Not wired into the build — run manually after content changes; commit the PNG.

import { readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

import {
  buildGraph,
  GRAPH_EDGE_STYLE,
  LINK_THICKNESS,
  NODE_SIZE,
} from '../src/lib/graph.ts';
import { layoutGraph } from '../src/lib/graph-layout.ts';
import { TOPICS } from '../src/lib/topics.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'src/content');
const OUT_DIR = join(ROOT, 'public/images/og');
const OUT = join(OUT_DIR, 'portfolio-graph-v1.png');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// --- Palette — homepage-banner brand tokens (graph hexes are SVG-only). ---
const BG = '#1400c3'; // royal blue surface
const CREAM = '#f8f2da'; // primary text
const MUTED = '#bdb5ea'; // secondary text (cream dimmed toward the blue)
const ORANGE = '#fe4e02'; // brand accent
const PERI = '#9db4ff'; // light periwinkle — keeps topic nodes legible on blue
const PEACH = '#ffb38a'; // warm tint for the Volta group

// Categorical node colors, remapped into the brand family so the graph reads
// as part of the banner instead of a rainbow on blue. Hub groups anchor the
// palette; everything else falls back to cream for a calmer field.
const NODE_PAINT = {
  projects: ORANGE,
  articles: CREAM,
  topic: PERI,
  experiments: PEACH,
};
const NODE_FALLBACK = CREAM;

// Edge color + alpha per type. The site styles edges with CSS color-mix();
// a standalone SVG can't, so the same intent is expressed as hex + opacity.
// Explicit `related`/`children` links stay legible; thematic/`shared`/`core`
// edges fade back so the preview reads as structure, not a hairball.
const EDGE_PAINT = {
  related: [ORANGE, 0.55],
  children: [CREAM, 0.45],
  topic: [CREAM, 0.12],
  shared: [CREAM, 0.14],
  core: [ORANGE, 0.12],
};

// Legend entries — the node categories a reader actually sees in the preview,
// resolved against NODE_PAINT so the swatches match the plotted nodes.
const LEGEND = [
  ['Проекты', NODE_PAINT.projects],
  ['Статьи', NODE_PAINT.articles],
  ['Темы', NODE_PAINT.topic],
  ['Volta', NODE_PAINT.experiments],
];

// rsvg uses fontconfig, which does not know `-apple-system`; name a font that
// actually exists so the banner does not silently fall back to a default sans.
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// --- Load the RU collections from disk (the same set graph-data.ts feeds
// buildGraph) by parsing frontmatter with the `yaml` package. ---
function loadCollection(name) {
  const dir = join(CONTENT, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => {
      const raw = readFileSync(join(dir, f), 'utf8');
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const data = m ? parseYaml(m[1]) || {} : {};
      return { id: f, data };
    })
    .filter((e) => !e.data.draft);
}

const graph = buildGraph({
  projects: loadCollection('projects'),
  posts: loadCollection('posts'),
  parts: loadCollection('volta-parts'),
  topics: TOPICS,
  lang: 'ru',
});

// Same deterministic build-time layout the site renders, then fit to the panel.
// A wide world lets the spring simulation reach equilibrium INSIDE its margin —
// at the site's 900x560 the repulsion pins ~30 nodes to the border (harmless
// with zoom/pan, but a rectangular cage in a still image).
const WORLD = { w: 1000, h: 800 };
const laid = layoutGraph(graph, WORLD);
const nodes = laid.nodes;
const nodeById = new Map(nodes.map((n) => [n.id, n]));

const groupColor = (g) => NODE_PAINT[g] ?? NODE_FALLBACK;
const edgeEndpoints = (l) => {
  const a = nodeById.get(l.source);
  const b = nodeById.get(l.target);
  if (!a || !b) return null;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  const r = (b.size || 6) + 2;
  return { x1: a.x, y1: a.y, x2: b.x - (dx / d) * r, y2: b.y - (dy / d) * r };
};
const radius = (n) => (n.size || 6) * NODE_SIZE;

// --- Fit the laid-out world to the panel. Percentile bounds (3%..97%) drop the
// handful of far-flung topic outliers so they don't shrink the main cluster;
// those few nodes simply fall near the panel edge. ---
const PANEL = { x: 418, y: 8, w: 772, h: 614 };
const PAD = 16; // world units around the graph
const q = (sorted, p) => sorted[Math.max(0, Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1))))];
const fxs = nodes.map((n) => n.x).sort((a, b) => a - b);
const fys = nodes.map((n) => n.y).sort((a, b) => a - b);
const minX = q(fxs, 0.03) - PAD;
const maxX = q(fxs, 0.97) + PAD;
const minY = q(fys, 0.03) - PAD;
const maxY = q(fys, 0.97) + PAD;
const bw = maxX - minX;
const bh = maxY - minY;
const scale = Math.min(PANEL.w / bw, PANEL.h / bh);
const tx = PANEL.x + (PANEL.w - bw * scale) / 2 - minX * scale;
const ty = PANEL.y + (PANEL.h - bh * scale) / 2 - minY * scale;

const edgeSvg = laid.links
  .map((l) => {
    const e = edgeEndpoints(l);
    if (!e) return '';
    const [color, alpha] = EDGE_PAINT[l.type] || EDGE_PAINT.related;
    const width = LINK_THICKNESS * (0.6 + 1.6 * (l.weight || 1)) + 0.4;
    const dash = GRAPH_EDGE_STYLE[l.type];
    return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${color}" stroke-opacity="${alpha}" stroke-width="${width.toFixed(2)}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  })
  .join('\n      ');

// No node labels: at preview size they collapse into an unreadable text cloud.
// The legend in the identity column carries the meaning instead.
const nodeSvg = nodes
  .map((n) => {
    const r = radius(n).toFixed(2);
    return `<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${groupColor(n.group)}" stroke="${BG}" stroke-width="1.6"/>`;
  })
  .join('\n      ');

const legendSvg = LEGEND.map(([label, color], i) => {
  const y = 448 + i * 32;
  return `<circle cx="80" cy="${y - 5}" r="7" fill="${color}"/>
  <text x="98" y="${y}" font-family="${FONT}" font-size="18" font-weight="500" fill="${MUTED}">${esc(label)}</text>`;
}).join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" text-rendering="geometricPrecision">
  <defs>
    <clipPath id="graphPanel">
      <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.w}" height="${PANEL.h}" rx="20"/>
    </clipPath>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${ORANGE}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${ORANGE}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="0" y="0" width="1200" height="6" fill="${ORANGE}"/>

  <!-- decorative hexagons (subtle, mirrors the homepage banner) -->
  <g fill="none" stroke="${CREAM}" stroke-width="2" opacity="0.12">
    <polygon points="293,155 336,180 336,230 293,255 250,230 250,180"/>
    <polygon points="330,455 373,480 373,530 330,555 287,530 287,480"/>
  </g>

  <ellipse cx="${PANEL.x + PANEL.w / 2}" cy="${PANEL.y + PANEL.h / 2}" rx="${PANEL.w / 2}" ry="${PANEL.h / 2}" fill="url(#glow)"/>

  <!-- knowledge graph: real build-time positions -->
  <g clip-path="url(#graphPanel)">
    <g transform="translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${scale.toFixed(4)})">
      <g class="edges">
      ${edgeSvg}
      </g>
      <g class="nodes">
      ${nodeSvg}
      </g>
    </g>
  </g>

  <!-- identity block -->
  <g transform="translate(80,40) scale(1.4)">
    <polygon points="96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2" fill="none" stroke="${ORANGE}" stroke-width="4"/>
    <text x="50" y="61" font-family="${FONT}" font-size="30" font-weight="700" fill="${CREAM}" text-anchor="middle">NB</text>
  </g>

  <text x="80" y="250" font-family="${FONT}" font-size="46" font-weight="700" letter-spacing="-1" fill="${CREAM}">Nikita Boyarkin</text>
  <text x="80" y="292" font-family="${FONT}" font-size="22" font-weight="600" fill="${ORANGE}">Product / Data Analyst</text>
  <rect x="80" y="308" width="120" height="3" fill="${ORANGE}"/>

  <text x="80" y="356" font-family="${FONT}" font-size="17" font-weight="700" letter-spacing="3" fill="${CREAM}">ГРАФ КОНТЕНТА</text>
  <text x="80" y="388" font-family="${FONT}" font-size="16" font-weight="500" fill="${MUTED}">Проекты, статьи и темы,</text>
  <text x="80" y="410" font-family="${FONT}" font-size="16" font-weight="500" fill="${MUTED}">связанные реальными ссылками.</text>

  ${legendSvg}

  <rect x="80" y="574" width="120" height="3" fill="${ORANGE}"/>
  <text x="80" y="606" font-family="${FONT}" font-size="22" font-weight="500" fill="${CREAM}">nikitaboyarkin.github.io</text>
</svg>`;

const svgPath = join(tmpdir(), 'og-graph.svg');
writeFileSync(svgPath, svg);
const res = spawnSync('rsvg-convert', [svgPath, '-o', OUT], { encoding: 'utf8' });
try { unlinkSync(svgPath); } catch {}
if (res.status !== 0) {
  console.error('rsvg-convert failed:', res.stderr || res.stdout);
  process.exit(1);
}
console.log(`OK ${OUT} (${nodes.length} nodes, ${laid.links.length} links)`);
