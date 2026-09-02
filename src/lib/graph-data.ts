// Shared build-time graph data. Single source of truth for both the SSR
// KnowledgeGraph SVG (rendered at `astro build`) and the /graph.json endpoints,
// so they always agree on nodes, links and positions.
import { getCollection } from "astro:content";
import { buildGraph, mergePostsForLocale, type GraphData } from "./graph";
import { layoutGraph } from "./graph-layout";
import { TOPICS } from "./topics";

async function buildGraphFor(lang: "ru" | "en"): Promise<GraphData> {
  if (lang === "en") {
    const [projects, postsEn, parts, postsRu] = await Promise.all([
      getCollection("projects-en", (p) => !p.data.draft),
      getCollection("posts-en", (p) => !p.data.draft),
      getCollection("volta-parts-en", (p) => !p.data.draft),
      getCollection("posts", (p) => !p.data.draft),
    ]);
    const posts = mergePostsForLocale(postsRu, postsEn);
    return buildGraph({ projects, posts, parts, topics: TOPICS, lang: "en" });
  }
  const [projects, posts, parts] = await Promise.all([
    getCollection("projects", (p) => !p.data.draft),
    getCollection("posts", (p) => !p.data.draft),
    getCollection("volta-parts", (p) => !p.data.draft),
  ]);
  return buildGraph({ projects, posts, parts, topics: TOPICS, lang: "ru" });
}

/** Both deterministic layouts for the SSR component: the taxonomy-group layout
 *  (default, also what the JSON endpoints serve) and the community layout used
 *  by the client when the toggle switches to community mode. */
export async function getGraphLayouts(
  lang: "ru" | "en",
): Promise<{ group: GraphData; community: GraphData }> {
  const graph = await buildGraphFor(lang);
  return {
    group: layoutGraph(graph),
    community: layoutGraph(graph, { groupBy: "community" }),
  };
}

export async function getGraphData(lang: "ru" | "en"): Promise<GraphData> {
  return (await getGraphLayouts(lang)).group;
}
