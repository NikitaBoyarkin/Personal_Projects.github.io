import { pageviews, sessions, jsErrors, beaconFailures } from "./metrics";

export function parseBeacon(body: string | ArrayBuffer): Record<string, unknown>[] {
  const text = typeof body === "string" ? body : new TextDecoder().decode(body);
  const data = JSON.parse(text) as unknown;
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  return [data as Record<string, unknown>];
}

export function ingestEvent(event: Record<string, unknown>): void {
  const etype = event.type;
  const path = String(event.path ?? "/");
  const locale = String(event.locale ?? "unknown");
  if (etype === "pageview") {
    pageviews.inc({ path, locale });
    if (event.session_id) sessions.inc();
  } else if (etype === "error") {
    const errType =
      typeof event.error === "object" && event.error !== null
        ? String((event.error as { type?: unknown }).type ?? "unknown")
        : "unknown";
    jsErrors.inc({ path, type: errType });
  } else {
    beaconFailures.inc({ reason: "bad_shape" });
  }
}