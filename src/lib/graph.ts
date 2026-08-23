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
  note: 'var(--text-muted)',
  topic: '#b48ce0',
};

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

/** Topics that must not get project edges via the `tools` signal — tool names
 *  (Python, SQL) appear in nearly every project and would turn these nodes
 *  into black holes. They are still matched by post tags. */
const TOOL_TOPICS = new Set(["python", "sql"]);

/** Project↔project edge weight when two projects share `n` topics. */
const sharedTopicWeight = (n: number) => Math.min(1, 0.4 + 0.15 * n);

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
      url: `${localePrefix}posts/${slug}/`,
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
        addLink(`p:${a}`, `p:${b}`, sharedTopicWeight(shared.size), "shared");
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

  return {
    nodes: nodesWithSize,
    links,
  };
}