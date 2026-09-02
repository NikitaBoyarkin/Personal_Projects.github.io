// Build-time force-directed layout for the knowledge graph.
//
// Ports the client-side simulation that used to live in KnowledgeGraph.astro to
// a pure, synchronous, deterministic function, so the SVG can be server-rendered
// at `astro build` and the browser only handles zoom/pan/search/legend.
//
// Determinism: there is no randomness anywhere — initial positions are
// deterministic rings, forces are deterministic, and the tick loop runs a fixed
// alpha-decay schedule. The same input always produces the same layout, which
// keeps the SSR SVG and the /graph.json endpoints in agreement across builds.
import type { GraphData, GraphNode } from "./graph";

export interface LayoutOptions {
  /** World width in viewBox units. */
  width?: number;
  /** World height in viewBox units. */
  height?: number;
  /** Hard cap on simulation ticks (alpha decay usually stops first). */
  maxFrames?: number;
}

/** Cores (group hubs) are pulled toward the world center much harder than
 *  regular nodes so they sit at the hub of the graph. */
const CORE_GRAVITY = 5;
const isCore = (id: string) => id.startsWith("core:");

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const round2 = (v: number) => Math.round(v * 100) / 100;

export function layoutGraph(graph: GraphData, opts: LayoutOptions = {}): GraphData {
  const width = opts.width ?? 900;
  const height = opts.height ?? 560;
  const world = { w: width, h: height };

  // --- Initial positions: ring per group around the center, cores at the hub.
  // The force loop below only has to refine a near-converged layout instead of
  // pulling a random scatter together (which is what made the old client
  // simulation run ~15s and visibly shake).
  const nodes: SimNode[] = graph.nodes.map((n) => ({ ...n, x: 0, y: 0, vx: 0, vy: 0 }));
  const groups: Record<string, SimNode[]> = {};
  for (const n of nodes) (groups[n.group] = groups[n.group] || []).push(n);
  const groupKeys = Object.keys(groups);
  const cx = world.w / 2;
  const cy = world.h / 2;
  const ringRadius = Math.min(world.w, world.h) * 0.35;
  groupKeys.forEach((gk, gi) => {
    const ga = (groupKeys.length === 1 ? 0 : (gi / groupKeys.length) * 2 * Math.PI) - Math.PI / 2;
    const gx = cx + Math.cos(ga) * ringRadius;
    const gy = cy + Math.sin(ga) * ringRadius;
    groups[gk].forEach((n, ni) => {
      const a = (ni / Math.max(1, groups[gk].length)) * 2 * Math.PI;
      const r = 30 + ni * 10;
      n.x = gx + Math.cos(a) * r;
      n.y = gy + Math.sin(a) * r;
    });
  });
  let coreI = 0;
  for (const n of nodes) {
    if (!isCore(n.id)) continue;
    const a = (coreI++ / 2) * 2 * Math.PI;
    n.x = cx + Math.cos(a) * 42;
    n.y = cy + Math.sin(a) * 42;
  }

  // --- Resolve links to node references (drop dangling edges defensively).
  const idx = new Map(nodes.map((n) => [n.id, n]));
  const links = graph.links
    .map((l) => ({
      source: idx.get(l.source),
      target: idx.get(l.target),
      weight: typeof l.weight === "number" ? l.weight : 1,
    }))
    .filter(
      (l): l is { source: SimNode; target: SimNode; weight: number } =>
        Boolean(l.source && l.target),
    );

  // --- Force simulation (same constants as the old client renderer).
  const N = Math.max(1, nodes.length);
  const charge = 2200 * Math.sqrt(N); // repulsion grows with N
  const gravity = 0.004 + 0.001 * Math.sqrt(N); // pull-to-center grows mildly
  const damp = 0.86;
  const margin = Math.min(80, 60 + N * 0.5);
  // Alpha-based settling (d3-force style): every force scales with `alpha`,
  // which decays exponentially each tick, so the layout converges and stops on
  // its own instead of running a fixed frame count and shaking.
  const alphaDecay = Math.max(0.015, 0.03 - 0.001 * Math.sqrt(N));
  const alphaMin = 0.01;
  const maxFrames = opts.maxFrames ?? Math.max(400, N * 10);
  let alpha = 1;

  for (let frame = 0; frame < maxFrames && alpha >= alphaMin; frame++) {
    // Pairwise repulsion.
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy || 1;
        const d = Math.sqrt(d2);
        const f = (charge / d2) * alpha;
        a.vx += (dx / d) * f;
        a.vy += (dy / d) * f;
        b.vx -= (dx / d) * f;
        b.vy -= (dy / d) * f;
      }
    }
    // Link springs: stronger edges pull closer (ideal length shrinks with weight).
    for (const l of links) {
      const dx = l.target.x - l.source.x;
      const dy = l.target.y - l.source.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const ideal = 60 + 80 * (1 - l.weight);
      const f = (d - ideal) * 0.04 * (0.5 + 0.5 * l.weight) * alpha;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      l.source.vx += fx;
      l.source.vy += fy;
      l.target.vx -= fx;
      l.target.vy -= fy;
    }
    // Center gravity + integration.
    for (const n of nodes) {
      const g = isCore(n.id) ? gravity * CORE_GRAVITY : gravity;
      n.vx += (world.w / 2 - n.x) * g * alpha;
      n.vy += (world.h / 2 - n.y) * g * alpha;
      n.vx *= damp;
      n.vy *= damp;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(margin, Math.min(world.w - margin, n.x));
      n.y = Math.max(margin, Math.min(world.h - margin, n.y));
    }
    alpha *= 1 - alphaDecay;
  }

  return {
    nodes: nodes.map(({ vx, vy, ...n }) => ({ ...n, x: round2(n.x), y: round2(n.y) })),
    links: graph.links,
  };
}
