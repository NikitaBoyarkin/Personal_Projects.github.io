from prometheus_client import REGISTRY, generate_latest

from red_exporter import metrics


def test_pageviews_counter_has_labels():
    metrics.PAGEVIEWS.labels(path="/", locale="ru").inc()
    out = generate_latest(REGISTRY).decode()
    assert 'portfolio_pageviews_total{locale="ru",path="/"}' in out


def test_duration_gauges_exist():
    metrics.LCP.labels(path="/").set(1.542)
    out = generate_latest(REGISTRY).decode()
    assert 'portfolio_lcp_seconds{path="/"}' in out


def test_js_errors_labels():
    metrics.JS_ERRORS.labels(path="/", type="TypeError").inc()
    out = generate_latest(REGISTRY).decode()
    assert 'portfolio_js_errors_total{path="/",type="TypeError"}' in out