import os
from red_exporter.config import get_settings


def test_settings_load_from_env(monkeypatch):
    monkeypatch.setenv("POSTHOG_API_KEY", "phx_test_key")
    monkeypatch.setenv("POSTHOG_PROJECT_ID", "451732")
    monkeypatch.setenv("POSTHOG_HOST", "https://us.posthog.com")
    monkeypatch.setenv("POSTHOG_PULL_INTERVAL", "15")
    monkeypatch.setenv("POSTHOG_PULL_WINDOW", "30m")
    monkeypatch.setenv("SITE_ORIGIN", "https://nikitaboyarkin.github.io")
    monkeypatch.setenv("BEACON_PORT", "9100")
    s = get_settings()
    assert s.posthog_api_key == "phx_test_key"
    assert s.posthog_project_id == "451732"
    assert s.posthog_pull_interval == 15
    assert s.site_origin == "https://nikitaboyarkin.github.io"
    assert s.beacon_port == 9100
