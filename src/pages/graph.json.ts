// Build-time knowledge graph (RU). Replaces the hand-curated public/graph.json
// so the graph always reflects the actual content collections.
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { buildGraph } from "../lib/graph";
import { TOPICS } from "../lib/topics";

export async function GET(_context: APIContext) {
  const [projects, posts, parts] = await Promise.all([
    getCollection("projects", (p) => !p.data.draft),
    getCollection("posts", (p) => !p.data.draft),
    getCollection("volta-parts", (p) => !p.data.draft),
  ]);

  const data = buildGraph({ projects, posts, parts, topics: TOPICS, lang: "ru" });

  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}