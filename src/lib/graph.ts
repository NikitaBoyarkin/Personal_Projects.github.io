// Knowledge-graph builder for /graph.json and /graph-en.json.
// Nodes = projects (group by track), posts (group by category), volta parts and
// topics. Edges = related links, volta children, post↔topic (tag match),
// project↔topic (signal match) and project↔project via shared topics.
//
// Every node carries a `url` (relative, locale-prefixed) so the client can
// navigate from the graph. Every edge carries a `weight` (strength) and a
// `type` so the force layout can pull strong links closer and style them.
//
// Decoupled from astro:content via minimal structural interfaces so it stays
// portable and testable (same pattern as lib/topics.ts).
import { TOPICS, type Topic } from "./topics";

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  /** Relative page URL (no base, locale-prefixed), e.g. `projects/volta/`. */
  url: string;
  /** Node radius in world units, derived from kind + degree (hub ≈ bigger). */
  size?: number;
  /** Emergent community id (greedy modularity), 0-based. Cuts across `group`. */
  community?: number;
  /** Human-readable community name (per-locale), e.g. "Аналитический тулкит". */
  communityLabel?: string;
}

export type LinkType = "related" | "children" | "topic" | "shared";

export interface GraphLink {
  source: string;
  target: string;
  /** Edge strength 0..1. Drives ideal spring length in the layout. */
  weight: number;
  type: LinkType;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/** Group colors shared by the SSR legend and the client-side renderer. */
export const GRAPH_GROUP_COLORS: Record<string, string> = {
  experiments: '#5db8b0',
  analytics: 'var(--text-accent)',
  product: '#c9a24a',
  engineering: '#9d7bd8',
  guide: '#4caf78',
  framework: '#e06c6c',
  'decision-log': '#5b9bd5',
  // Fixed slate (not var(--text-muted)) so note nodes don't blend into edges.
  note: '#8fa3b8',
  topic: '#b48ce0',
};

/** Community palette — 10 distinct hues for the emergent clusters. Hex (not
 *  CSS vars) so community colors stay distinguishable in both themes. */
export const GRAPH_COMMUNITY_COLORS = [
  '#e06c6c', // red
  '#5b9bd5', // blue
  '#4caf78', // green
  '#c9a24a', // gold
  '#9d7bd8', // purple
  '#5db8b0', // teal
  '#e08a5b', // orange
  '#b48ce0', // lavender
  '#6c8ae0', // indigo
  '#8fa3b8', // slate
];

interface ProjectLike {
  id: string;
  data: {
    title: string;
    track?: string;
    related?: string[];
    children?: string[];
    tools?: string[];
    description?: string;
  };
}

interface PostLike {
  id: string;
  data: {
    title: string;
    category?: string;
    tags?: string[];
    related?: string[];
    /** Optional URL override — used by the EN graph for untranslated posts so
     *  they link to the RU page instead of a missing EN page. */
    url?: string;
  };
}

interface PartLike {
  id: string;
  data: { title: string };
}

const slugOf = (id: string) => id.replace(/\.md$/, "");

/** Parse a related-path entry into a typed internal target, or null if it is
 *  an external URL or not a project/post path. Handles both locales. */
export function parseRelatedPath(
  path: string,
): { type: "project" | "post"; slug: string } | null {
  const m = path.match(/^\/(?:en\/)?(projects|posts)\/([^/]+)\/?$/);
  if (!m) return null;
  return { type: m[1] === "projects" ? "project" : "post", slug: m[2] };
}

/** Merge EN posts with RU fallback so both locale graphs stay in sync: a post
 *  that has an EN translation keeps its EN title and EN page URL; an
 *  untranslated post falls back to the RU entry (RU title, RU page URL) — the
 *  same convention the EN project pages already use for related links. */
export function mergePostsForLocale(
  ruPosts: PostLike[],
  enPosts: PostLike[],
): PostLike[] {
  const enBySlug = new Map(enPosts.map((p) => [slugOf(p.id), p]));
  return ruPosts.map((p) => {
    const slug = slugOf(p.id);
    const en = enBySlug.get(slug);
    if (en) return en;
    return { ...p, data: { ...p.data, url: `posts/${slug}/` } };
  });
}

/** Extract the `hops`-hop neighborhood of a node from a full graph. Used by the
 *  per-project mini-graph: the project node plus everything it links to.
 *  BFS by frontier: each hop expands only from nodes added in the previous hop,
 *  so a 1-hop subgraph never cascades into 2-hop nodes. */
export function subgraphAround(
  graph: GraphData,
  centerId: string,
  hops = 1,
): GraphData {
  if (!graph.nodes.some((n) => n.id === centerId)) {
    return { nodes: [], links: [] };
  }
  const include = new Set<string>([centerId]);
  let frontier = new Set<string>([centerId]);
  for (let h = 0; h < hops; h++) {
    const next = new Set<string>();
    for (const l of graph.links) {
      if (frontier.has(l.source) && !include.has(l.target)) {
        include.add(l.target);
        next.add(l.target);
      }
      if (frontier.has(l.target) && !include.has(l.source)) {
        include.add(l.source);
        next.add(l.source);
      }
    }
    frontier = next;
  }
  return {
    nodes: graph.nodes.filter((n) => include.has(n.id)),
    links: graph.links.filter((l) => include.has(l.source) && include.has(l.target)),
  };
}

/** Topics that must not get project edges via the `tools` signal — tool names
 *  (Python, SQL) appear in nearly every project and would turn these nodes
 *  into black holes. They are still matched by post tags. */
const TOOL_TOPICS = new Set(["python", "sql"]);

/** Lateral edge weight when two nodes share `n` signals (topics/tags/tools).
 *  Salience grows with evidence, mirroring the vault linker's scoring. */
const sharedSignalWeight = (n: number) => Math.min(1, 0.4 + 0.15 * n);

/** Community labels keyed by a representative node id per cluster. Resolved at
 *  build time by finding which representative each community contains, so labels
 *  survive community renumbering when content changes. Fallback: `#<id>`. */
const COMMUNITY_LABELS: Record<'ru' | 'en', [string, string][]> = {
  ru: [
    ['p:site', 'Карьера и портфолио'],
    ['p:sql', 'Аналитический тулкит'],
    ['p:volta', 'Эксперименты и петля Volta'],
  ],
  en: [
    ['p:bot', 'Automation'],
    ['p:sql', 'Analytics toolkit'],
    ['p:site', 'Portfolio & site'],
    ['p:volta', 'Experiments & Volta loop'],
  ],
};

/** Greedy modularity maximization (Clauset–Newman–Moore) for community
 *  detection. Deterministic: pairs are scanned in a fixed order and ties break
 *  to the first pair, so the result is reproducible across builds. Modularity
 *  explicitly penalizes oversized communities, so high-degree topic hubs
 *  (sql, python) don't sweep the whole graph the way label propagation does.
 *  Communities are renumbered by first-seen order → small, stable ids.
 */
export function detectCommunities(
  nodes: { id: string }[],
  links: { source: string; target: string }[],
): Map<string, number> {
  const m = links.length;
  const result = new Map<string, number>();
  if (m === 0) {
    nodes.forEach((n, i) => result.set(n.id, i));
    return result;
  }

  // Undirected adjacency (deduped).
  const adj = new Map<string, Set<string>>();
  for (const n of nodes) adj.set(n.id, new Set());
  for (const l of links) {
    adj.get(l.source)?.add(l.target);
    adj.get(l.target)?.add(l.source);
  }

  // Start: every node is its own community.
  const comm = new Map<string, number>();
  nodes.forEach((n, i) => comm.set(n.id, i));
  const members = nodes.map((n) => new Set([n.id]));
  const L = nodes.map(() => 0); // internal edges per community
  const K = nodes.map(() => 0); // degree sum per community
  for (const n of nodes) K[comm.get(n.id)!] = adj.get(n.id)!.size;
  for (const l of links) {
    if (comm.get(l.source) === comm.get(l.target)) L[comm.get(l.source)!]++;
  }
  // Edges between communities (upper triangle).
  const E: number[][] = nodes.map(() => nodes.map(() => 0));
  for (const l of links) {
    const a = comm.get(l.source)!;
    const b = comm.get(l.target)!;
    if (a !== b) E[Math.min(a, b)][Math.max(a, b)]++;
  }

  const twoM = 2 * m;
  // Greedy merge loop: repeatedly merge the pair with the largest ΔQ > 0.
  for (;;) {
    let bestDelta = 0;
    let bestA = -1;
    let bestB = -1;
    for (let a = 0; a < nodes.length; a++) {
      if (members[a].size === 0) continue;
      for (let b = a + 1; b < nodes.length; b++) {
        if (members[b].size === 0 || E[a][b] === 0) continue;
        const delta = 2 * (E[a][b] / m - (K[a] / twoM) * (K[b] / twoM));
        if (delta > bestDelta) {
          bestDelta = delta;
          bestA = a;
          bestB = b;
        }
      }
    }
    if (bestA < 0) break;
    // Merge bestB into bestA.
    for (const id of members[bestB]) {
      comm.set(id, bestA);
      members[bestA].add(id);
    }
    members[bestB].clear();
    L[bestA] += L[bestB] + E[bestA][bestB];
    K[bestA] += K[bestB];
    for (let c = 0; c < nodes.length; c++) {
      if (c === bestA || members[c].size === 0) continue;
      const eBc = E[Math.min(bestB, c)][Math.max(bestB, c)];
      if (eBc > 0) {
        E[Math.min(bestA, c)][Math.max(bestA, c)] += eBc;
        E[Math.min(bestB, c)][Math.max(bestB, c)] = 0;
      }
    }
    E[bestA][bestB] = 0;
  }

  // Renumber by first-seen order so ids are stable and compact.
  const idByComm = new Map<number, number>();
  for (const n of nodes) {
    const c = comm.get(n.id)!;
    if (!idByComm.has(c)) idByComm.set(c, idByComm.size);
    result.set(n.id, idByComm.get(c)!);
  }
  return result;
}

export function buildGraph(opts: {
  projects: ProjectLike[];
  posts: PostLike[];
  parts: PartLike[];
  topics?: Topic[];
  lang?: "ru" | "en";
}): GraphData {
  const { projects, posts, parts, topics = TOPICS, lang = "ru" } = opts;
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeById = new Map<string, GraphNode>();
  const linkKey = new Set<string>();

  const addNode = (n: GraphNode) => {
    if (!nodeById.has(n.id)) {
      nodeById.set(n.id, n);
      nodes.push(n);
    }
  };

  const addLink = (
    a: string,
    b: string,
    weight: number,
    type: LinkType,
  ) => {
    if (a === b || !nodeById.has(a) || !nodeById.has(b)) return;
    const key = [a, b].sort().join("\u0000");
    if (linkKey.has(key)) return;
    linkKey.add(key);
    links.push({ source: a, target: b, weight, type });
  };

  const localePrefix = lang === "en" ? "en/" : "";

  // Node pass.
  for (const p of projects) {
    const slug = slugOf(p.id);
    addNode({
      id: `p:${slug}`,
      label: p.data.title,
      group: p.data.track || "analytics",
      url: `${localePrefix}projects/${slug}/`,
    });
  }
  for (const post of posts) {
    const slug = slugOf(post.id);
    addNode({
      id: `post:${slug}`,
      label: post.data.title,
      group: post.data.category || "note",
      url: post.data.url ?? `${localePrefix}posts/${slug}/`,
    });
  }
  for (const part of parts) {
    const slug = slugOf(part.id);
    addNode({
      id: `vp:${slug}`,
      label: part.data.title,
      group: "experiments",
      url: `${localePrefix}projects/volta/${slug}/`,
    });
  }
  for (const t of topics) {
    addNode({
      id: `topic:${t.key}`,
      label: lang === "en" ? t.key : t.label,
      group: "topic",
      url: `${localePrefix}topics/${t.key}/`,
    });
  }

  // Related links (project↔project, project↔post, post↔post) — strongest.
  for (const p of projects) {
    const from = `p:${slugOf(p.id)}`;
    for (const rel of p.data.related ?? []) {
      const parsed = parseRelatedPath(rel);
      if (!parsed) continue;
      const to = parsed.type === "project" ? `p:${parsed.slug}` : `post:${parsed.slug}`;
      addLink(from, to, 1, "related");
    }
    for (const child of p.data.children ?? []) {
      addLink(from, `vp:${child}`, 1, "children");
    }
  }
  for (const post of posts) {
    const from = `post:${slugOf(post.id)}`;
    for (const rel of post.data.related ?? []) {
      const parsed = parseRelatedPath(rel);
      if (!parsed) continue;
      const to = parsed.type === "project" ? `p:${parsed.slug}` : `post:${parsed.slug}`;
      addLink(from, to, 1, "related");
    }
  }

  // post↔topic by tag match.
  for (const post of posts) {
    const from = `post:${slugOf(post.id)}`;
    for (const t of topics) {
      if ((post.data.tags ?? []).some((tag) => t.match(tag))) {
        addLink(from, `topic:${t.key}`, 0.6, "topic");
      }
    }
  }

  // project↔topic by signal match (slug/title/desc contains topic key).
  // `tools` is excluded for TOOL_TOPICS so python/sql don't become hubs.
  const projectTopics = new Map<string, Set<string>>();
  for (const p of projects) {
    const slug = slugOf(p.id);
    const matched = new Set<string>();
    const signals = [slug, p.data.title.toLowerCase(), (p.data.description ?? "").toLowerCase()];
    for (const t of topics) {
      const needle = t.key.replace("-", " ");
      const useTools = !TOOL_TOPICS.has(t.key);
      const hay = useTools ? [...signals, (p.data.tools ?? []).join(" ").toLowerCase()] : signals;
      if (hay.some((s) => s.includes(needle))) {
        addLink(`p:${slug}`, `topic:${t.key}`, 0.3, "topic");
        matched.add(t.key);
      }
    }
    projectTopics.set(slug, matched);
  }

  // Lateral links (mirror the vault linker: nodes that share concepts get a
  // direct related-style edge instead of only meeting through a topic hub).
  // Weight = salience, growing with the number of shared signals.

  // project↔project via shared topics (≥2 common topics → direct edge).
  const projectSlugs = projects.map((p) => slugOf(p.id));
  for (let i = 0; i < projectSlugs.length; i++) {
    for (let j = i + 1; j < projectSlugs.length; j++) {
      const a = projectSlugs[i];
      const b = projectSlugs[j];
      const shared = new Set(
        [...(projectTopics.get(a) ?? [])].filter((t) => projectTopics.get(b)?.has(t)),
      );
      if (shared.size >= 2) {
        addLink(`p:${a}`, `p:${b}`, sharedSignalWeight(shared.size), "shared");
      }
    }
  }

  // project↔project via shared tools (≥2 common tools → direct edge). `python`
  // and `sql` are excluded — the same TOOL_TOPICS guard that keeps them from
  // becoming topic hubs, since they appear in nearly every project.
  const projectTools = new Map<string, Set<string>>();
  for (const p of projects) {
    projectTools.set(
      slugOf(p.id),
      new Set(
        (p.data.tools ?? [])
          .map((t) => t.toLowerCase())
          .filter((t) => !TOOL_TOPICS.has(t)),
      ),
    );
  }
  for (let i = 0; i < projectSlugs.length; i++) {
    for (let j = i + 1; j < projectSlugs.length; j++) {
      const a = projectSlugs[i];
      const b = projectSlugs[j];
      const shared = new Set(
        [...(projectTools.get(a) ?? [])].filter((t) => projectTools.get(b)?.has(t)),
      );
      if (shared.size >= 2) {
        addLink(`p:${a}`, `p:${b}`, sharedSignalWeight(shared.size), "shared");
      }
    }
  }

  // post↔post via shared tags (≥2 common tags → direct edge).
  const postTags = new Map<string, Set<string>>();
  for (const post of posts) {
    postTags.set(slugOf(post.id), new Set(post.data.tags ?? []));
  }
  const postSlugs = posts.map((p) => slugOf(p.id));
  for (let i = 0; i < postSlugs.length; i++) {
    for (let j = i + 1; j < postSlugs.length; j++) {
      const a = postSlugs[i];
      const b = postSlugs[j];
      const shared = new Set(
        [...(postTags.get(a) ?? [])].filter((t) => postTags.get(b)?.has(t)),
      );
      if (shared.size >= 2) {
        addLink(`post:${a}`, `post:${b}`, sharedSignalWeight(shared.size), "shared");
      }
    }
  }

  // Drop topic nodes with no edges (e.g. a locale where no post/project maps
  // to that topic) — isolated theme pills are noise, not information.
  const edgeIds = new Set<string>();
  for (const l of links) {
    edgeIds.add(l.source);
    edgeIds.add(l.target);
  }

  // Node size: base by kind, scaled up by degree (hubs read bigger).
  const degrees = new Map<string, number>();
  for (const l of links) {
    degrees.set(l.source, (degrees.get(l.source) ?? 0) + 1);
    degrees.set(l.target, (degrees.get(l.target) ?? 0) + 1);
  }
  const BASE_SIZE: Record<string, number> = {
    p: 9,
    post: 7,
    vp: 7,
    topic: 6.5,
  };
  const nodesWithSize = nodes.filter(
    (n) => !(n.id.startsWith("topic:") && !edgeIds.has(n.id)),
  ).map((n) => {
    const kind = n.id.split(":")[0];
    const deg = degrees.get(n.id) ?? 0;
    const base = BASE_SIZE[kind] ?? 6.5;
    const size = base * (1 + 0.18 * Math.log1p(deg));
    return { ...n, size: Math.round(size * 10) / 10 };
  });

  // Community detection — emergent clusters that cut across the fixed
  // track/category taxonomy (e.g. "A/B methodology", "Volta loop").
  // Runs on the explicit structure (related/children/topic) only: lateral
  // `shared` edges add connectivity for the layout, but on a graph this small
  // they would collapse the taxonomy into one cluster if they drove the
  // clustering too. They still appear in the layout — just don't shape it.
  const explicitLinks = links.filter((l) => l.type !== "shared");
  const communities = detectCommunities(nodesWithSize, explicitLinks);

  // Resolve per-locale community labels by representative node: find which
  // community each representative landed in, then label every node in it.
  // Keyed by representative so labels survive community renumbering.
  const labelByCommunity = new Map<number, string>();
  for (const [rep, label] of COMMUNITY_LABELS[lang]) {
    const c = communities.get(rep);
    if (c !== undefined && !labelByCommunity.has(c)) {
      labelByCommunity.set(c, label);
    }
  }

  const nodesWithCommunity = nodesWithSize.map((n) => {
    const c = communities.get(n.id) ?? 0;
    return {
      ...n,
      community: c,
      communityLabel: labelByCommunity.get(c) ?? `#${c}`,
    };
  });

  return {
    nodes: nodesWithCommunity,
    links,
  };
}