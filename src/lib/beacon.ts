const SESSION_KEY = "red_session_id";

export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export interface BeaconEvent {
  type: "pageview" | "error";
  path: string;
  locale?: string;
  session_id: string;
  ts: number;
  error?: { type: string; message: string };
  [k: string]: unknown;
}

export function buildBeacon(
  type: "pageview" | "error",
  extra: Partial<BeaconEvent>,
): BeaconEvent {
  return {
    type,
    session_id: getSessionId(),
    ts: Date.now(),
    path: location.pathname,
    ...extra,
  } as BeaconEvent;
}

export function sendBeacon(endpoint: string, ev: BeaconEvent): void {
  try {
    navigator.sendBeacon(endpoint, JSON.stringify(ev));
  } catch {
    /* fail-silent */
  }
}