from fastapi.testclient import TestClient

from red_exporter import app as appmod


def test_healthz():
    c = TestClient(appmod.app)
    r = c.get("/healthz")
    assert r.status_code == 200


def test_beacon_accepts_pageview():
    c = TestClient(appmod.app)
    r = c.post(
        "/beacon",
        content=b'{"type":"pageview","path":"/","locale":"ru","session_id":"s"}',
    )
    assert r.status_code == 204


def test_beacon_bad_json_returns_400():
    c = TestClient(appmod.app)
    r = c.post("/beacon", content=b"not json")
    assert r.status_code == 400


def test_metrics_exposes_exposition():
    c = TestClient(appmod.app)
    r = c.get("/metrics")
    assert r.status_code == 200
    assert "portfolio_pageviews_total" in r.text
    assert "portfolio_lcp_seconds" in r.text