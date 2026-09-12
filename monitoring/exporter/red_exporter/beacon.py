from __future__ import annotations

import json

from . import metrics


def parse_beacon(body: bytes) -> list[dict]:
    """Parse a beacon payload (single object or array) into a list of events."""
    data = json.loads(body.decode("utf-8"))
    if isinstance(data, dict):
        return [data]
    if isinstance(data, list):
        return data
    raise ValueError("beacon payload must be object or array")


def ingest_event(event: dict) -> None:
    """Increment the right metric for one beacon event. Bad shape -> failure counter."""
    etype = event.get("type")
    path = event.get("path", "/")
    locale = event.get("locale", "unknown")
    if etype == "pageview":
        metrics.PAGEVIEWS.labels(path=path, locale=locale).inc()
        if event.get("session_id"):
            metrics.SESSIONS.inc()
    elif etype == "error":
        etype_err = event.get("error", {}).get("type", "unknown")
        metrics.JS_ERRORS.labels(path=path, type=etype_err).inc()
    else:
        metrics.BEACON_FAILURES.labels(reason="bad_shape").inc()