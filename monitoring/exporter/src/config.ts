export interface Settings {
  posthogApiKey: string;
  posthogProjectId: string;
  posthogHost: string;
  posthogPullInterval: number;
  posthogPullWindow: string;
  siteOrigin: string;
  beaconPort: number;
  beaconDbPath: string;
  startPoller: boolean;
}

export function getSettings(env: Record<string, string | undefined> = Bun.env): Settings {
  return {
    posthogApiKey: env.POSTHOG_API_KEY ?? "",
    posthogProjectId: env.POSTHOG_PROJECT_ID ?? "",
    posthogHost: env.POSTHOG_HOST ?? "https://us.posthog.com",
    posthogPullInterval: Number(env.POSTHOG_PULL_INTERVAL ?? "15"),
    posthogPullWindow: env.POSTHOG_PULL_WINDOW ?? "30m",
    siteOrigin: env.SITE_ORIGIN ?? "*",
    beaconPort: Number(env.BEACON_PORT ?? "9100"),
    beaconDbPath: env.BEACON_DB ?? "",
    startPoller: env.START_POLLER === "1",
  };
}