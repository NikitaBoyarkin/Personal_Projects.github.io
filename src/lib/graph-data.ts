// Shared build-time graph data for the /graph.json endpoints and the
// server-rendered KnowledgeGraph.astro. Single source of truth so the JSON and
// the SSR SVG always agree on nodes, links and positions.
import { getCollection } from "astro:content";
import { buildGraph, mergePostsForLocale, type GraphData } from "./graph";
import { layoutGraph } from "./graph-layout";
import { TOPICS } from "./topics";

export async function getGraphData(lang: "ru" | "en"): Promise<GraphData> {
  if (lang === "en") {
    const [projects, postsEn, parts, postsRu] = await Promise.all([
      getCollection("projects-en", (p) => !p.data.draft),
      getCollection("posts-en", (p) => !p.data.draft),
      getCollection("volta-parts-en", (p) => !p.data.draft),
      getCollection("posts", (p) => !p.data.draft),
    ]);
    const posts = mergePostsForLocale(postsRu, postsEn);
    return layoutGraph(buildGraph({ projects, posts, parts, topics: TOPICS, lang: "en" }));
  }
  const [projects, posts, parts] = await Promise.all([
    getCollection("projects", (p) => !p.data.draft),
    getCollection("posts", (p) => !p.data.draft),
    getCollection("volta-parts", (p) => !p.data.draft),
  ]);
  return layoutGraph(buildGraph({ projects, posts, parts, topics: TOPICS, lang: "ru" }));
}
