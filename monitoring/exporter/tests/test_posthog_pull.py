from prometheus_client import REGISTRY, generate_latest

from red_exporter import posthog_pull


def _out():
    return generate_latest(REGISTRY).decode()


SAMPLE = {"results": [{"path": "/", "lcp": 1542, "inp": 78, "cls": 0.002, "fcp": 290}]}


def test_parse_vitals():
    v = posthog_pull.parse_vitals(SAMPLE)
    assert "/" in v
    assert v["/"]["lcp"] == 1542


def test_update_gauges_sets_values():
    posthog_pull.update_gauges(
        {"/": {"lcp": 1.542, "inp": 0.078, "cls": 0.002, "fcp": 0.290}}
    )
    out = _out()
    assert 'portfolio_lcp_seconds{path="/"} 1.542' in out
    assert 'portfolio_cls{path="/"} 0.002' in out


def test_pull_once_handles_error(monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("network down")

    monkeypatch.setattr(posthog_pull, "_post_to_posthog", boom)
    before = REGISTRY.get_sample_value("portfolio_posthog_pull_errors_total") or 0
    posthog_pull.pull_once(posthog_pull._fake_settings())
    after = REGISTRY.get_sample_value("portfolio_posthog_pull_errors_total")
    assert after == before + 1