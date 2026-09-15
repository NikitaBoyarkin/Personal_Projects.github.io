import type { Settings } from "./config";
import {
  lcp,
  inp,
  cls,
  fcp,
  posthogPullErrors,
  posthogPullDuration,
} from "./metrics";

const VITALS_QUERY = `
SELECT
  properties.$pathname AS path,
  quantile(0.75)(properties.$web_vitals_LCP_value / 1000.0) AS lcp,
  quantile(0.75)(properties.$web_vitals_INP_value / 1000.0) AS inp,
  quantile(0.75)(properties.$web_vitals_CLS_value) AS cls,
  quantile(0.75)(properties.$web_vitals_FCP_value / 1000.0) AS fcp
FROM events
WHERE event = '$web_vitals'
  AND timestamp > now() - INTERVAL {window:raw}
GROUP BY path
`;

export interface PosthogQueryPayload {
  query: {
    kind: "HogQLQuery";
    query: string;
    values: { window: string };
  };
}

export function queryPayload(window: string): PosthogQueryPayload {
  return {
    query: {
      kind: "HogQLQuery",
      query: VITALS_QUERY,
      values: { window },
    },
  };
}

export async function postToPosthog(settings: Settings): Promise<unknown> {
  const url = `${settings.posthogHost}/api/projects/${settings.posthogProjectId}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.posthogApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(queryPayload(settings.posthogPullWindow)),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`PostHog query failed: ${res.status}`);
  return res.json();
}

export interface Vitals {
  lcp?: number | null;
  inp?: number | null;
  cls?: number | null;
  fcp?: number | null;
}

export function parseVitals(resp: unknown): Record<string, Vitals> {
  const out: Record<string, Vitals> = {};
  const obj = resp as { results?: unknown };
  let results: unknown = obj?.results;
  if (results !== null && typeof results === "object" && !Array.isArray(results)) {
    results = (results as { results?: unknown }).results;
  }
  if (!Array.isArray(results)) return out;
  for (const row of results) {
    let path: unknown;
    let vals: Vitals;
    if (Array.isArray(row)) {
      path = row[0];
      vals = {
        lcp: row[1] as number | null | undefined,
        inp: row[2] as number | null | undefined,
        cls: row[3] as number | null | undefined,
        fcp: row[4] as number | null | undefined,
      };
    } else {
      const r = row as Record<string, unknown>;
      path = r.path;
      vals = {
        lcp: r.lcp as number | null | undefined,
        inp: r.inp as number | null | undefined,
        cls: r.cls as number | null | undefined,
        fcp: r.fcp as number | null | undefined,
      };
    }
    if (!path) continue;
    out[String(path)] = vals;
  }
  return out;
}

export function updateGauges(vitals: Record<string, Vitals>): void {
  for (const [path, v] of Object.entries(vitals)) {
    if (v.lcp != null) lcp.set(Number(v.lcp), { path });
    if (v.inp != null) inp.set(Number(v.inp), { path });
    if (v.cls != null) cls.set(Number(v.cls), { path });
    if (v.fcp != null) fcp.set(Number(v.fcp), { path });
  }
}

export async function pullOnce(settings: Settings): Promise<void> {
  const start = Date.now();
  try {
    const resp = await postToPosthog(settings);
    updateGauges(parseVitals(resp));
  } catch {
    posthogPullErrors.inc();
  } finally {
    posthogPullDuration.set((Date.now() - start) / 1000);
  }
}