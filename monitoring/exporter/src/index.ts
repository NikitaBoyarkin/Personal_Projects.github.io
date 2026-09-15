import { getSettings, type Settings } from "./config";
import { exporterUp } from "./metrics";
import { pullOnce } from "./posthog-pull";
import { openBeaconStore } from "./db";
import { createServer } from "./app";

const settings = getSettings();
const store = settings.beaconDbPath ? openBeaconStore(settings.beaconDbPath) : null;

function startPoller(settings: Settings): void {
  exporterUp.set(1);
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await pullOnce(settings);
    } finally {
      running = false;
    }
    setTimeout(tick, settings.posthogPullInterval * 1000);
  };
  setTimeout(tick, 0);
}

const server = createServer(settings, store);

if (settings.startPoller) {
  startPoller(settings);
}

console.log(`red-exporter (bun) listening on :${server.port}`);