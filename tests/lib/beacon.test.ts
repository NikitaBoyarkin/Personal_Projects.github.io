// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { buildBeacon, getSessionId } from "../../src/lib/beacon";

describe("beacon", () => {
  beforeEach(() => sessionStorage.clear());

  it("builds a pageview payload", () => {
    const b = buildBeacon("pageview", { path: "/", locale: "ru" });
    expect(b.type).toBe("pageview");
    expect(b.path).toBe("/");
    expect(b.session_id).toBeTruthy();
    expect(typeof b.ts).toBe("number");
  });

  it("getSessionId is stable within a session", () => {
    const a = getSessionId();
    const b = getSessionId();
    expect(a).toBe(b);
  });
});