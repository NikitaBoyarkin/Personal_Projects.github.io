import { describe, it, expect } from 'vitest';
import { buildGraph, type GraphNode } from '../../src/lib/graph';
import { layoutGraph } from '../../src/lib/graph-layout';
import { TOPICS } from '../../src/lib/topics';

// layoutGraph fills x/y on every node; the GraphNode type keeps them optional
// (absent before layout), so tests narrow the result.
type LaidNode = GraphNode & { x: number; y: number };
const laid = (graph: ReturnType<typeof buildGraph>, opts?: Parameters<typeof layoutGraph>[1]) =>
  layoutGraph(graph, opts) as { nodes: LaidNode[]; links: ReturnType<typeof buildGraph>['links'] };

const project = (
  slug: string,
  extra: Partial<{ track: string; related: string[]; children: string[]; tools: string[]; description: string; title: string }> = {},
) => ({
  id: `${slug}.md`,
  data: {
    title: extra.title ?? slug,
    track: extra.track,
    related: extra.related ?? [],
    children: extra.children ?? [],
    tools: extra.tools ?? [],
    description: extra.description ?? '',
  },
});

const post = (
  slug: string,
  extra: Partial<{ category: string; tags: string[]; related: string[]; title: string }> = {},
) => ({
  id: `${slug}.md`,
  data: {
    title: extra.title ?? slug,
    category: extra.category ?? 'note',
    tags: extra.tags ?? [],
    related: extra.related ?? [],
  },
});

function sampleGraph() {
  return buildGraph({
    projects: [
      project('volta', { track: 'experiments', children: ['funnel', 'ab'], related: ['/posts/ab-calibration/'] }),
      project('rfm', { track: 'experiments', related: ['/posts/cohort-triangles/'] }),
      project('supabase', { track: 'fullstack', description: 'retention cohort segmentation' }),
      project('streamlit', { track: 'fullstack', description: 'retention segmentation funnel' }),
    ],
    posts: [
      post('ab-calibration', { category: 'guide', tags: ['ab-testing'], related: ['/projects/volta/'] }),
      post('cohort-triangles', { category: 'note', tags: ['retention', 'cohort-analysis'] }),
    ],
    parts: [
      { id: 'funnel.md', data: { title: 'Funnel' } },
      { id: 'ab.md', data: { title: 'AB' } },
    ],
    topics: TOPICS,
    lang: 'ru',
  });
}

describe('layoutGraph', () => {
  it('is deterministic: the same input always produces the same positions', () => {
    const graph = sampleGraph();
    const a = laid(graph);
    const b = laid(graph);
    expect(a.nodes).toHaveLength(b.nodes.length);
    for (let i = 0; i < a.nodes.length; i++) {
      expect(a.nodes[i].x).toBe(b.nodes[i].x);
      expect(a.nodes[i].y).toBe(b.nodes[i].y);
    }
  });

  it('places every node at finite coordinates inside the world', () => {
    const graph = sampleGraph();
    const out = laid(graph, { width: 900, height: 560 });
    for (const n of out.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(900);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(560);
    }
  });

  it('rounds positions to 2 decimals', () => {
    const graph = sampleGraph();
    const out = laid(graph);
    for (const n of out.nodes) {
      expect(n.x).toBe(Math.round(n.x * 100) / 100);
      expect(n.y).toBe(Math.round(n.y * 100) / 100);
    }
  });

  it('pulls core hubs toward the center more than regular nodes', () => {
    const graph = sampleGraph();
    const out = laid(graph);
    const cx = 450;
    const cy = 280;
    const dist = (n: { x: number; y: number }) => Math.hypot(n.x - cx, n.y - cy);
    const cores = out.nodes.filter((n) => n.id.startsWith('core:'));
    const regular = out.nodes.filter((n) => !n.id.startsWith('core:'));
    expect(cores.length).toBeGreaterThan(0);
    const avgCore = cores.reduce((s, n) => s + dist(n), 0) / cores.length;
    const avgRegular = regular.reduce((s, n) => s + dist(n), 0) / regular.length;
    expect(avgCore).toBeLessThan(avgRegular);
  });

  it('keeps the node set and links intact', () => {
    const graph = sampleGraph();
    const out = laid(graph);
    expect(out.nodes.map((n) => n.id).sort()).toEqual(graph.nodes.map((n) => n.id).sort());
    expect(out.links).toHaveLength(graph.links.length);
    for (let i = 0; i < graph.links.length; i++) {
      expect(out.links[i].source).toBe(graph.links[i].source);
      expect(out.links[i].target).toBe(graph.links[i].target);
    }
  });

  it('handles a graph with no content (only core hubs) without crashing', () => {
    const graph = buildGraph({ projects: [], posts: [], parts: [], topics: TOPICS });
    const out = laid(graph);
    // buildGraph still emits the two core hubs; layout must place them finitely.
    expect(out.links).toEqual([]);
    expect(out.nodes.length).toBeGreaterThan(0);
    for (const n of out.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
  });
});
