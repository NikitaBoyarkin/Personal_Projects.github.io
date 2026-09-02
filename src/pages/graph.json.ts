// Build-time knowledge graph (RU). Replaces the hand-curated public/graph.json
// so the graph always reflects the actual content collections. Nodes carry
// layout positions (x/y) computed at build time for the SSR SVG.
import type { APIContext } from "astro";
import { getGraphData } from "../lib/graph-data";

export async function GET(_context: APIContext) {
  const data = await getGraphData("ru");

  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}
