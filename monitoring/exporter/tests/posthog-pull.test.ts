import { describe, it, expect, beforeEach } from "bun:test";
import { queryPayload, parseVitals, updateGauges } from "../src/posthog-pull";
import { lcp, inp } from "../src/metrics";

describe("queryPayload", () => {
  it("builds a HogQL payload with the window value", () => {
    const p = queryPayload("30m");
    expect(p.query.kind).toBe("HogQLQuery");
    expect(p.query.values).toEqual({ window: "30m" });
    expect(p.query.query).toContain("$web_vitals");
  });
});

describe("parseVitals", () => {
  it("handles the flat/test response shape", () => {
    const v = parseVitals({
      results: [{ path: "/", lcp: 1.5, inp: 0.2, cls: 0.01, fcp: 1.0 }],
    });
    expect(v["/"].lcp).toBe(1.5);
    expect(v["/"].cls).toBe(0.01);
  });

  it("handles the real HogQL nested shape", () => {
    const v = parseVitals({
      results: { results: [["/", 1.5, 0.2, 0.01, 1.0]] },
    });
    expect(v["/"].inp).toBe(0.2);
    expect(v["/"].fcp).toBe(1.0);
  });

  it("skips rows without a path", () => {
    const v = parseVitals({ results: [{ lcp: 1.5 }] });
    expect(Object.keys(v)).toHaveLength(0);
  });
});

describe("updateGauges", () => {
  beforeEach(() => {
    lcp.set(0, { path: "/" });
    inp.set(0, { path: "/" });
  });

  it("sets gauges from vitals", () => {
    updateGauges({ "/": { lcp: 2.5, inp: 0.3 } });
    expect(lcp.get({ path: "/" })).toBe(2.5);
    expect(inp.get({ path: "/" })).toBe(0.3);
  });
});