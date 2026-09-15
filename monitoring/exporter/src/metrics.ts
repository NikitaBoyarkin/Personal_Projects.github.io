export type MetricType = "counter" | "gauge";
export type LabelValues = Record<string, string>;

export interface Family {
  name: string;
  help: string;
  type: MetricType;
  labelNames: string[];
}

interface Sample {
  labels: LabelValues;
  value: number;
}

class Metric {
  readonly name: string;
  readonly help: string;
  readonly type: MetricType;
  readonly labelNames: string[];
  private samples = new Map<string, Sample>();

  constructor(def: Family) {
    this.name = def.name;
    this.help = def.help;
    this.type = def.type;
    this.labelNames = def.labelNames;
  }

  private key(labels: LabelValues): string {
    return this.labelNames.map((n) => `${n}=${labels[n] ?? ""}`).join("\u0000");
  }

  inc(labelsOrN: LabelValues | number = {}, n = 1): void {
    let labels: LabelValues;
    if (typeof labelsOrN === "number") {
      labels = {};
      n = labelsOrN;
    } else {
      labels = labelsOrN;
    }
    const k = this.key(labels);
    const s = this.samples.get(k) ?? { labels: { ...labels }, value: 0 };
    s.value += n;
    this.samples.set(k, s);
  }

  set(value: number, labels: LabelValues = {}): void {
    this.samples.set(this.key(labels), { labels: { ...labels }, value });
  }

  get(labels: LabelValues = {}): number | undefined {
    return this.samples.get(this.key(labels))?.value;
  }

  clear(): void {
    this.samples.clear();
  }

  snapshot(): Sample[] {
    return [...this.samples.values()].map((s) => ({ labels: { ...s.labels }, value: s.value }));
  }
}

function counter(name: string, help: string, labelNames: string[]): Metric {
  return new Metric({ name, help, type: "counter", labelNames });
}

function gauge(name: string, help: string, labelNames: string[]): Metric {
  return new Metric({ name, help, type: "gauge", labelNames });
}

// --- Rate (beacon) ---
export const pageviews = counter("portfolio_pageviews_total", "Total pageviews", ["path", "locale"]);
export const sessions = counter("portfolio_sessions_total", "Total sessions", []);
export const activeSessions = gauge("portfolio_active_sessions", "Active sessions", []);

// --- Errors (beacon / exporter) ---
export const jsErrors = counter("portfolio_js_errors_total", "JS errors", ["path", "type"]);
export const beaconFailures = counter("portfolio_beacon_failures_total", "Beacon ingestion failures", ["reason"]);

// --- Duration (PostHog pull, p75 per path) ---
export const lcp = gauge("portfolio_lcp_seconds", "LCP p75 (seconds)", ["path"]);
export const inp = gauge("portfolio_inp_seconds", "INP p75 (seconds)", ["path"]);
export const cls = gauge("portfolio_cls", "CLS p75", ["path"]);
export const fcp = gauge("portfolio_fcp_seconds", "FCP p75 (seconds)", ["path"]);

// --- Rate cross-check (PostHog pull) ---
export const posthogPageviews30d = gauge("portfolio_posthog_pageviews_30d", "PostHog pageviews last 30d", []);

// --- Self / exporter health ---
export const posthogPullErrors = counter("portfolio_posthog_pull_errors_total", "PostHog pull errors", []);
export const posthogPullDuration = gauge("portfolio_posthog_pull_duration_seconds", "PostHog pull duration (s)", []);
export const exporterUp = gauge("portfolio_exporter_up", "Exporter up", []);

const FAMILIES: Metric[] = [
  pageviews,
  sessions,
  activeSessions,
  jsErrors,
  beaconFailures,
  lcp,
  inp,
  cls,
  fcp,
  posthogPageviews30d,
  posthogPullErrors,
  posthogPullDuration,
  exporterUp,
];

export function resetAll(): void {
  for (const m of FAMILIES) m.clear();
}

export function escapeLabel(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

export function render(): string {
  const lines: string[] = [];
  for (const m of FAMILIES) {
    lines.push(`# HELP ${m.name} ${m.help}`);
    lines.push(`# TYPE ${m.name} ${m.type}`);
    for (const s of m.snapshot()) {
      const labels = m.labelNames
        .map((n) => `${n}="${escapeLabel(s.labels[n] ?? "")}"`)
        .join(",");
      const suffix = labels.length ? `{${labels}}` : "";
      lines.push(`${m.name}${suffix} ${s.value}`);
    }
  }
  return lines.join("\n") + "\n";
}