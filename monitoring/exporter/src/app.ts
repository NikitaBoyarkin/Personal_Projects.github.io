import type { Settings } from "./config";
import { ingestEvent, parseBeacon } from "./beacon";
import { beaconFailures, render } from "./metrics";
import type { BeaconStore } from "./db";

export function createHandler(settings: Settings, store: BeaconStore | null): (req: Request) => Promise<Response> {
  const origin = settings.siteOrigin === "*" ? "*" : settings.siteOrigin;

  function cors(res: Response): Response {
    const headers = new Headers(res.headers);
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "POST, OPTIONS");
    headers.set("access-control-allow-headers", "*");
    return new Response(res.body, { status: res.status, headers });
  }

  return async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
    if (req.method === "GET" && url.pathname === "/healthz") {
      return cors(Response.json({ ok: true }));
    }
    if (req.method === "GET" && url.pathname === "/metrics") {
      return cors(
        new Response(render(), {
          headers: { "content-type": "text/plain; version=0.0.4; charset=utf-8" },
        }),
      );
    }
    if (req.method === "POST" && url.pathname === "/beacon") {
      try {
        const events = parseBeacon(await req.arrayBuffer());
        for (const ev of events) {
          ingestEvent(ev);
          store?.append(ev);
        }
        return cors(new Response(null, { status: 204 }));
      } catch {
        beaconFailures.inc({ reason: "parse" });
        return cors(new Response(null, { status: 400 }));
      }
    }
    return cors(new Response("Not found", { status: 404 }));
  };
}

export function createServer(settings: Settings, store: BeaconStore | null) {
  return Bun.serve({ port: settings.beaconPort, fetch: createHandler(settings, store) });
}