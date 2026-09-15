import { describe, it, expect, beforeEach } from "bun:test";
import {
  pageviews,
  sessions,
  lcp,
  escapeLabel,
  render,
  resetAll,
} from "../src/metrics";

beforeEach(() => resetAll());

describe("metrics", () => {
  it("increments a labeled counter and reads it back", () => {
    pageviews.inc({ path: "/", locale: "ru" });
    pageviews.inc({ path: "/", locale: "ru" });
    expect(pageviews.get({ path: "/", locale: "ru" })).toBe(2);
    expect(pageviews.get({ path: "/", locale: "en" })).toBeUndefined();
  });

  it("increments a no-label counter", () => {
    sessions.inc();
    sessions.inc(3);
    expect(sessions.get({})).toBe(4);
  });

  it("gauge sets a value", () => {
    lcp.set(1.25, { path: "/" });
    expect(lcp.get({ path: "/" })).toBe(1.25);
  });

  it("render emits prometheus text format", () => {
    pageviews.inc({ path: "/", locale: "ru" });
    pageviews.inc({ path: "/", locale: "ru" });
    const out = render();
    expect(out).toContain("# HELP portfolio_pageviews_total Total pageviews");
    expect(out).toContain("# TYPE portfolio_pageviews_total counter");
    expect(out).toContain('portfolio_pageviews_total{path="/",locale="ru"} 2');
    expect(out).toContain("# TYPE portfolio_exporter_up gauge");
  });

  it("escapes label values", () => {
    expect(escapeLabel('a"b\\c\nd')).toBe('a\\"b\\\\c\\nd');
  });
});