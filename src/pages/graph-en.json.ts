// Build-time knowledge graph (EN mirror). Uses the EN collections and English
// topic keys as labels. Emitted at /graph-en.json.
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { buildGraph } from "../lib/graph";
import { TOPICS } from "../lib/topics";

export async function GET(_context: APIContext) {
  const [projects, posts, parts] = await Promise.all([
    getCollection("projects-en", (p) => !p.data.draft),
    getCollection("posts-en", (p) => !p.data.draft),
    getCollection("volta-parts-en", (p) => !p.data.draft),
  ]);

  const data = buildGraph({ projects, posts, parts, topics: TOPICS, lang: "en" });

  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}