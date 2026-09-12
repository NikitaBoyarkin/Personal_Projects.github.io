from prometheus_client import REGISTRY

from red_exporter import beacon


# NOTE: counter increments are verified via REGISTRY.get_sample_value (value
# before/after), not string-counting the exposition line — a counter's line
# appears once regardless of its value, so .count() could never detect an inc.

def test_parse_single_and_array():
    assert beacon.parse_beacon(b'{"type":"pageview"}') == [{"type": "pageview"}]
    assert beacon.parse_beacon(b'[{"type":"pageview"}]') == [{"type": "pageview"}]


def test_parse_invalid_raises():
    try:
        beacon.parse_beacon(b"not json")
        assert False
    except ValueError:
        pass


def test_ingest_pageview_increments_counter():
    labels = {"path": "/", "locale": "ru"}
    before = REGISTRY.get_sample_value("portfolio_pageviews_total", labels) or 0
    beacon.ingest_event(
        {"type": "pageview", "path": "/", "locale": "ru", "session_id": "s1"}
    )
    after = REGISTRY.get_sample_value("portfolio_pageviews_total", labels)
    assert after == before + 1


def test_ingest_error_event():
    labels = {"path": "/", "type": "TypeError"}
    before = REGISTRY.get_sample_value("portfolio_js_errors_total", labels) or 0
    beacon.ingest_event(
        {
            "type": "error",
            "path": "/",
            "locale": "ru",
            "error": {"type": "TypeError", "message": "x"},
        }
    )
    after = REGISTRY.get_sample_value("portfolio_js_errors_total", labels)
    assert after == before + 1


def test_ingest_bad_event_counts_failure():
    labels = {"reason": "bad_shape"}
    before = REGISTRY.get_sample_value("portfolio_beacon_failures_total", labels) or 0
    beacon.ingest_event({"type": "unknown"})
    after = REGISTRY.get_sample_value("portfolio_beacon_failures_total", labels)
    assert after == before + 1