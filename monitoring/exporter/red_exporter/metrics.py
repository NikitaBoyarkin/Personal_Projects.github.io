from prometheus_client import Counter, Gauge

# --- Rate (beacon) ---
PAGEVIEWS = Counter("portfolio_pageviews_total", "Total pageviews", ["path", "locale"])
SESSIONS = Counter("portfolio_sessions_total", "Total sessions")
ACTIVE_SESSIONS = Gauge("portfolio_active_sessions", "Active sessions")

# --- Errors (beacon / exporter) ---
JS_ERRORS = Counter("portfolio_js_errors_total", "JS errors", ["path", "type"])
BEACON_FAILURES = Counter(
    "portfolio_beacon_failures_total", "Beacon ingestion failures", ["reason"]
)

# --- Duration (PostHog pull, p75 per path) ---
LCP = Gauge("portfolio_lcp_seconds", "LCP p75 (seconds)", ["path"])
INP = Gauge("portfolio_inp_seconds", "INP p75 (seconds)", ["path"])
CLS = Gauge("portfolio_cls", "CLS p75", ["path"])
FCP = Gauge("portfolio_fcp_seconds", "FCP p75 (seconds)", ["path"])

# --- Rate cross-check (PostHog pull) ---
POSTHOG_PAGEVIEWS_30D = Gauge(
    "portfolio_posthog_pageviews_30d", "PostHog pageviews last 30d"
)

# --- Self / exporter health ---
POSTHOG_PULL_ERRORS = Counter(
    "portfolio_posthog_pull_errors_total", "PostHog pull errors"
)
POSTHOG_PULL_DURATION = Gauge(
    "portfolio_posthog_pull_duration_seconds", "PostHog pull duration (s)"
)
EXPORTER_UP = Gauge("portfolio_exporter_up", "Exporter up")