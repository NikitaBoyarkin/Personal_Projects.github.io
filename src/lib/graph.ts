// Knowledge-graph builder for /graph.json and /graph-en.json.
// Nodes = projects (group by track), posts (group by category), volta parts and
// topics. Edges = related links, volta children, post↔topic (tag match) and
// project↔topic (signal match, mirroring computeTopicRows).
//
// Decoupled from astro:content via minimal structural interfaces so it stays
// portable and testable (same pattern as lib/topics.ts).
import { TOPICS, type Topic } from "./topics";

export interface GraphNode {
  id: string;
  label: string;
  group: string;
}

export interface GraphLink {
  source: string;
  target: string;
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

  const addLink = (a: string, b: string) => {
    if (a === b || !nodeById.has(a) || !nodeById.has(b)) return;
    const key = [a, b].sort().join("\u0000");
    if (linkKey.has(key)) return;
    linkKey.add(key);
    links.push({ source: a, target: b });
  };

  // Node pass.
  for (const p of projects) {
    const slug = slugOf(p.id);
    addNode({ id: `p:${slug}`, label: p.data.title, group: p.data.track || "analytics" });
  }
  for (const post of posts) {
    const slug = slugOf(post.id);
    addNode({ id: `post:${slug}`, label: post.data.title, group: post.data.category || "note" });
  }
  for (const part of parts) {
    const slug = slugOf(part.id);
    addNode({ id: `vp:${slug}`, label: part.data.title, group: "experiments" });
  }
  for (const t of topics) {
    addNode({ id: `topic:${t.key}`, label: lang === "en" ? t.key : t.label, group: "topic" });
  }

  // Related links (project↔project, project↔post, post↔post).
  for (const p of projects) {
    const from = `p:${slugOf(p.id)}`;
    for (const rel of p.data.related ?? []) {
      const parsed = parseRelatedPath(rel);
      if (!parsed) continue;
      const to = parsed.type === "project" ? `p:${parsed.slug}` : `post:${parsed.slug}`;
      addLink(from, to);
    }
    for (const child of p.data.children ?? []) {
      addLink(from, `vp:${child}`);
    }
  }
  for (const post of posts) {
    const from = `post:${slugOf(post.id)}`;
    for (const rel of post.data.related ?? []) {
      const parsed = parseRelatedPath(rel);
      if (!parsed) continue;
      const to = parsed.type === "project" ? `p:${parsed.slug}` : `post:${parsed.slug}`;
      addLink(from, to);
    }
  }

  // post↔topic by tag match.
  for (const post of posts) {
    const from = `post:${slugOf(post.id)}`;
    for (const t of topics) {
      if ((post.data.tags ?? []).some((tag) => t.match(tag))) addLink(from, `topic:${t.key}`);
    }
  }

  // project↔topic by signal match (slug/title/tools/desc contains topic key).
  for (const p of projects) {
    const slug = slugOf(p.id);
    const signals = [
      slug,
      p.data.title.toLowerCase(),
      (p.data.tools ?? []).join(" ").toLowerCase(),
      (p.data.description ?? "").toLowerCase(),
    ];
    for (const t of topics) {
      const needle = t.key.replace("-", " ");
      if (signals.some((s) => s.includes(needle))) addLink(`p:${slug}`, `topic:${t.key}`);
    }
  }

  // Drop topic nodes with no edges (e.g. a locale where no post/project maps
  // to that topic) — isolated theme pills are noise, not information.
  const edgeIds = new Set<string>();
  for (const l of links) {
    edgeIds.add(l.source);
    edgeIds.add(l.target);
  }
  return {
    nodes: nodes.filter((n) => !(n.id.startsWith("topic:") && !edgeIds.has(n.id))),
    links,
  };
}