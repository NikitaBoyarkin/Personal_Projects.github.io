import { describe, it, expect } from "bun:test";
import { getSettings } from "../src/config";

describe("getSettings", () => {
  it("uses defaults when env is empty", () => {
    const s = getSettings({});
    expect(s.posthogApiKey).toBe("");
    expect(s.posthogProjectId).toBe("");
    expect(s.posthogHost).toBe("https://us.posthog.com");
    expect(s.posthogPullInterval).toBe(15);
    expect(s.posthogPullWindow).toBe("30m");
    expect(s.siteOrigin).toBe("*");
    expect(s.beaconPort).toBe(9100);
    expect(s.beaconDbPath).toBe("");
    expect(s.startPoller).toBe(false);
  });

  it("reads env values", () => {
    const s = getSettings({
      POSTHOG_HOST: "https://eu.posthog.com",
      POSTHOG_PULL_INTERVAL: "30",
      POSTHOG_PULL_WINDOW: "1h",
      SITE_ORIGIN: "https://nikitaboyarkin.github.io",
      BEACON_PORT: "9101",
      BEACON_DB: "/data/beacon.sqlite",
      START_POLLER: "1",
    });
    expect(s.posthogHost).toBe("https://eu.posthog.com");
    expect(s.posthogPullInterval).toBe(30);
    expect(s.posthogPullWindow).toBe("1h");
    expect(s.siteOrigin).toBe("https://nikitaboyarkin.github.io");
    expect(s.beaconPort).toBe(9101);
    expect(s.beaconDbPath).toBe("/data/beacon.sqlite");
    expect(s.startPoller).toBe(true);
  });
});