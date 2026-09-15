import { describe, it, expect, beforeEach } from "bun:test";
import { parseBeacon, ingestEvent } from "../src/beacon";
import { pageviews, sessions, jsErrors, beaconFailures, resetAll } from "../src/metrics";

beforeEach(() => resetAll());

describe("parseBeacon", () => {
  it("parses a single object", () => {
    const evs = parseBeacon(JSON.stringify({ type: "pageview", path: "/" }));
    expect(evs).toHaveLength(1);
    expect(evs[0].type).toBe("pageview");
  });

  it("parses an array", () => {
    const evs = parseBeacon(
      JSON.stringify([{ type: "pageview", path: "/" }, { type: "error" }]),
    );
    expect(evs).toHaveLength(2);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseBeacon("not json")).toThrow();
  });
});

describe("ingestEvent", () => {
  it("increments pageviews and sessions when a session id is present", () => {
    ingestEvent({ type: "pageview", path: "/", locale: "ru", session_id: "s1" });
    expect(pageviews.get({ path: "/", locale: "ru" })).toBe(1);
    expect(sessions.get({})).toBe(1);
  });

  it("counts js errors with a type label", () => {
    ingestEvent({ type: "error", path: "/x", error: { type: "TypeError" } });
    expect(jsErrors.get({ path: "/x", type: "TypeError" })).toBe(1);
  });

  it("flags bad shapes", () => {
    ingestEvent({ type: "nope" });
    expect(beaconFailures.get({ reason: "bad_shape" })).toBe(1);
  });
});