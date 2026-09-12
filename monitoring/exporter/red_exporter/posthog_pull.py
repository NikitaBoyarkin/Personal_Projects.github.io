from __future__ import annotations

import time

import requests

from . import metrics

# HogQL: web-vitals p75 per path over a window. Window token like "30m".
VITALS_QUERY = """
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
"""


def _fake_settings():
    from .config import Settings

    return Settings(
        posthog_api_key="k",
        posthog_project_id="451732",
        posthog_host="https://us.posthog.com",
        posthog_pull_interval=15,
        posthog_pull_window="30m",
        site_origin="*",
        beacon_port=9100,
    )


def query_payload(settings, window: str) -> dict:
    return {
        "query": {
            "kind": "HogQLQuery",
            "query": VITALS_QUERY,
            "values": {"window": window},
        }
    }


def _post_to_posthog(settings, payload):
    url = f"{settings.posthog_host}/api/projects/{settings.posthog_project_id}/query"
    r = requests.post(
        url,
        json=payload,
        headers={"Authorization": f"Bearer {settings.posthog_api_key}"},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()


def parse_vitals(resp_json: dict) -> dict[str, dict]:
    """Path -> {lcp, inp, cls, fcp}.

    Tolerates two response shapes:
      * flat/test:   {"results": [{"path": "/", "lcp": ...}, ...]}
      * real HogQL:  {"results": {"results": [["/", 1.5, ...], ...]}}
    """
    out: dict[str, dict] = {}
    results = resp_json.get("results", [])
    if isinstance(results, dict):
        results = results.get("results", [])
    if not isinstance(results, list):
        return out
    for row in results:
        path = row[0] if isinstance(row, list) else row.get("path")
        if not path:
            continue
        if isinstance(row, list):
            vals = {"lcp": row[1], "inp": row[2], "cls": row[3], "fcp": row[4]}
        else:
            vals = {
                "lcp": row.get("lcp"),
                "inp": row.get("inp"),
                "cls": row.get("cls"),
                "fcp": row.get("fcp"),
            }
        out[path] = vals
    return out


def update_gauges(vitals: dict[str, dict]) -> None:
    for path, v in vitals.items():
        if v.get("lcp") is not None:
            metrics.LCP.labels(path=path).set(v["lcp"])
        if v.get("inp") is not None:
            metrics.INP.labels(path=path).set(v["inp"])
        if v.get("cls") is not None:
            metrics.CLS.labels(path=path).set(v["cls"])
        if v.get("fcp") is not None:
            metrics.FCP.labels(path=path).set(v["fcp"])


def pull_once(settings) -> None:
    start = time.time()
    try:
        payload = query_payload(settings, settings.posthog_pull_window)
        resp = _post_to_posthog(settings, payload)
        vitals = parse_vitals(resp)
        update_gauges(vitals)
    except Exception:
        metrics.POSTHOG_PULL_ERRORS.inc()
    finally:
        metrics.POSTHOG_PULL_DURATION.set(time.time() - start)