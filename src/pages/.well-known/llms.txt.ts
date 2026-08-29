// Well-known alias per llmstxt.org: /.well-known/llms.txt is the canonical
// discovery URL; /llms.txt also works. One generator, two routes — see
// src/lib/llms-txt.ts. Emitted at /.well-known/llms.txt.
import type { APIContext } from "astro";
import { buildLlmsTxt } from "../../lib/llms-txt";

const SITE = "https://nikitaboyarkin.github.io";

export async function GET(context: APIContext) {
  const site = (context.site?.toString() ?? SITE).replace(/\/$/, "");
  const body = await buildLlmsTxt(site);
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
