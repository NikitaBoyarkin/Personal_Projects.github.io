from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    posthog_api_key: str
    posthog_project_id: str
    posthog_host: str
    posthog_pull_interval: int
    posthog_pull_window: str
    site_origin: str
    beacon_port: int


def get_settings() -> Settings:
    # All fields use os.environ.get with defaults so module import never crashes
    # (app.py calls get_settings() at import; tests import it with no env set).
    # POSTHOG_API_KEY presence is enforced at poller runtime, not import.
    return Settings(
        posthog_api_key=os.environ.get("POSTHOG_API_KEY", ""),
        posthog_project_id=os.environ.get("POSTHOG_PROJECT_ID", ""),
        posthog_host=os.environ.get("POSTHOG_HOST", "https://us.posthog.com"),
        posthog_pull_interval=int(os.environ.get("POSTHOG_PULL_INTERVAL", "15")),
        posthog_pull_window=os.environ.get("POSTHOG_PULL_WINDOW", "30m"),
        site_origin=os.environ.get("SITE_ORIGIN", "*"),
        beacon_port=int(os.environ.get("BEACON_PORT", "9100")),
    )