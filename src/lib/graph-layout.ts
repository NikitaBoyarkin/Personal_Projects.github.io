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
import type { GraphData, GraphNode, LinkType } from "./graph";

export interface LayoutOptions {
  /** World width in viewBox units. */
  width?: number;
  /** World height in viewBox units. */
  height?: number;
  /** Hard cap on simulation ticks (alpha decay usually stops first). */
  maxFrames?: number;
  /** Which grouping the layout clusters: the explicit taxonomy groups
   *  (default) or the emergent communities. */
  groupBy?: "group" | "community";
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
  const isCommunity = opts.groupBy === "community";
  // Bucket key: taxonomy group by default, emergent community id otherwise.
  const keyOf = (n: SimNode) => (isCommunity ? (n.community ?? 0) : n.group);

  // --- Initial positions: ring per bucket (group or community) around the
  // center, cores at the hub. The force loop below only has to refine a
  // near-converged layout instead of pulling a random scatter together (which
  // is what made the old client simulation run ~15s and visibly shake).
  const nodes: SimNode[] = graph.nodes.map((n) => ({ ...n, x: 0, y: 0, vx: 0, vy: 0 }));
  const buckets: Record<string, SimNode[]> = {};
  for (const n of nodes) {
    const k = String(keyOf(n));
    (buckets[k] = buckets[k] || []).push(n);
  }
  const bucketKeys = Object.keys(buckets);
  const cx = world.w / 2;
  const cy = world.h / 2;
  const ringRadius = Math.min(world.w, world.h) * 0.35;
  bucketKeys.forEach((bk, bi) => {
    const ga = (bucketKeys.length === 1 ? 0 : (bi / bucketKeys.length) * 2 * Math.PI) - Math.PI / 2;
    const gx = cx + Math.cos(ga) * ringRadius;
    const gy = cy + Math.sin(ga) * ringRadius;
    buckets[bk].forEach((n, ni) => {
      const a = (ni / Math.max(1, buckets[bk].length)) * 2 * Math.PI;
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
      type: l.type,
    }))
    .filter(
      (l): l is { source: SimNode; target: SimNode; weight: number; type: LinkType } =>
        // In community mode the group-hub springs (hub -> members) would fight
        // the community pull, dragging members back toward their taxonomy hub.
        Boolean(l.source && l.target) && !(isCommunity && l.type === "core"),
    );

  // --- Force simulation (same constants as the old client renderer).
  const N = Math.max(1, nodes.length);
  const charge = 2200 * Math.sqrt(N); // repulsion grows with N
  const gravity = 0.004 + 0.001 * Math.sqrt(N); // pull-to-center grows mildly
  // Community mode clusters members around their centroid; stronger than the
  // center gravity so clusters stay coherent, weak enough for the pairwise
  // repulsion to spread members inside a cluster.
  const communityGravity = gravity * 4;
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
    // Community mode: pull each node toward its community's centroid so the
    // cluster reads as one blob (the group-hub springs are excluded above).
    if (isCommunity) {
      const centroids = new Map<number, { x: number; y: number; n: number }>();
      for (const n of nodes) {
        const c = n.community ?? 0;
        const acc = centroids.get(c) || { x: 0, y: 0, n: 0 };
        acc.x += n.x;
        acc.y += n.y;
        acc.n++;
        centroids.set(c, acc);
      }
      for (const n of nodes) {
        const acc = centroids.get(n.community ?? 0)!;
        n.vx += (acc.x / acc.n - n.x) * communityGravity * alpha;
        n.vy += (acc.y / acc.n - n.y) * communityGravity * alpha;
      }
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
