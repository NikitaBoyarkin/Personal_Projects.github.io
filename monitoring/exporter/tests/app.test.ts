import { describe, it, expect, beforeEach } from "bun:test";
import { getSettings } from "../src/config";
import { createHandler } from "../src/app";
import { pageviews, beaconFailures, resetAll } from "../src/metrics";

const settings = getSettings({ SITE_ORIGIN: "*" });

beforeEach(() => resetAll());

function call(path: string, init?: RequestInit): Promise<Response> {
  const handler = createHandler(settings, null);
  return handler(new Request(`http://localhost:9100${path}`, init));
}

describe("app", () => {
  it("healthz returns ok", async () => {
    const res = await call("/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("beacon 204 on a valid single event and increments metrics", async () => {
    const res = await call("/beacon", {
      method: "POST",
      body: JSON.stringify({ type: "pageview", path: "/", locale: "ru" }),
    });
    expect(res.status).toBe(204);
    expect(pageviews.get({ path: "/", locale: "ru" })).toBe(1);
  });

  it("beacon 204 on an array of events", async () => {
    const res = await call("/beacon", {
      method: "POST",
      body: JSON.stringify([
        { type: "pageview", path: "/a", locale: "ru" },
        { type: "pageview", path: "/b", locale: "ru" },
      ]),
    });
    expect(res.status).toBe(204);
    expect(pageviews.get({ path: "/a", locale: "ru" })).toBe(1);
    expect(pageviews.get({ path: "/b", locale: "ru" })).toBe(1);
  });

  it("beacon 400 on invalid json and flags a parse failure", async () => {
    const res = await call("/beacon", { method: "POST", body: "{bad" });
    expect(res.status).toBe(400);
    expect(beaconFailures.get({ reason: "parse" })).toBe(1);
  });

  it("metrics returns prometheus content type", async () => {
    const res = await call("/metrics");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    const body = await res.text();
    expect(body).toContain("# TYPE portfolio_beacon_failures_total counter");
  });

  it("unknown path returns 404", async () => {
    const res = await call("/nope");
    expect(res.status).toBe(404);
  });
});