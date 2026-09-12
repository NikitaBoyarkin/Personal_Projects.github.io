from __future__ import annotations

import os
import threading
import time

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from . import beacon, metrics, posthog_pull
from .config import get_settings

app = FastAPI(title="red-exporter")
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.site_origin == "*" else [settings.site_origin],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz():
    return {"ok": True}


@app.post("/beacon")
async def beacon_ep(request: Request):
    body = await request.body()
    try:
        events = beacon.parse_beacon(body)
    except ValueError:
        metrics.BEACON_FAILURES.labels(reason="parse").inc()
        return Response(status_code=400)
    for ev in events:
        beacon.ingest_event(ev)
    return Response(status_code=204)


@app.get("/metrics")
def metrics_ep():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


def start_poller_thread() -> threading.Thread:
    def loop():
        while True:
            posthog_pull.pull_once(settings)
            time.sleep(settings.posthog_pull_interval)

    t = threading.Thread(target=loop, daemon=True)
    t.start()
    return t


# Start the background PostHog poller only when explicitly requested, so that
# importing `app` in tests never spawns a thread that would hit the network.
if os.environ.get("START_POLLER") == "1":
    start_poller_thread()
    metrics.EXPORTER_UP.set(1)