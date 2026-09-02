// Build-time knowledge graph (EN mirror). Uses the EN collections and English
// topic keys as labels. Posts are merged with a RU fallback so the EN graph
// stays in sync with the RU one: translated posts keep their EN title/URL,
// untranslated posts appear with their RU title and link to the RU page.
// Emitted at /graph-en.json.
import type { APIContext } from "astro";
import { getGraphData } from "../lib/graph-data";

export async function GET(_context: APIContext) {
  const data = await getGraphData("en");

  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}
