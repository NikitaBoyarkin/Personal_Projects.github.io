// Build-time knowledge graph (EN mirror). Uses the EN collections and English
// topic keys as labels. Posts are merged with a RU fallback so the EN graph
// stays in sync with the RU one: translated posts keep their EN title/URL,
// untranslated posts appear with their RU title and link to the RU page.
// Emitted at /graph-en.json.
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { buildGraph, mergePostsForLocale } from "../lib/graph";
import { TOPICS } from "../lib/topics";

export async function GET(_context: APIContext) {
  const [projects, postsEn, parts, postsRu] = await Promise.all([
    getCollection("projects-en", (p) => !p.data.draft),
    getCollection("posts-en", (p) => !p.data.draft),
    getCollection("volta-parts-en", (p) => !p.data.draft),
    getCollection("posts", (p) => !p.data.draft),
  ]);

  const posts = mergePostsForLocale(postsRu, postsEn);
  const data = buildGraph({ projects, posts, parts, topics: TOPICS, lang: "en" });

  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}