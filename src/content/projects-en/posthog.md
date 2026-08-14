---
title: TaskFlow — PostHog Product Analytics Pipeline
description: End-to-end portfolio project — instrument a SaaS product with PostHog, generate realistic traffic, and analyze the events into a funnel, cohort retention, an A/B test, revenue/LTV, and time-to-convert, all in Python.
hero: images/posthog.svg
impact:
  - Typed event catalog (single source of truth) + PostHog capture/identify/group with PII scrubbing
  - Feature flag → onboarding A/B variant; A/B analysis with chi-square, uplift, Wilson CI + SRM check
  - Day-N cohort retention, time-to-convert, revenue/LTV, first-feature → upgrade conversion
  - The same metrics as SQL (BI / interview reference) + interactive Streamlit dashboard
  - CI (pytest + ruff) + Docker + render.yaml for one-click deploy
tools:
  - Python
  - PostHog
  - FastAPI
  - Streamlit
  - pandas / matplotlib
  - pytest / ruff
  - Docker
github: https://github.com/NikitaBoyarkin/posthog-saas-analytics
private: true
related:
  - /en/projects/supabase/
caseStudy:
  problem: "Product analytics is usually shown on a cleaned CSV. The hard part — instrumenting a real app, capturing the right events without PII leaks, getting them into a tool, and turning raw events into decisions — stays invisible."
  approach: "Built a demo SaaS (FastAPI + Jinja2) with server-side PostHog capture over a typed event catalog (single source of truth), a PostHog wrapper that scrubs PII, and a feature flag driving an onboarding A/B. A simulator generates 30 days of realistic funnel traffic; analysis scripts turn the pulled events into funnel, cohort retention, A/B (chi-square + uplift + Wilson CI + SRM check), revenue/LTV, time-to-convert, and feature-usage → upgrade. The same metrics are written as SQL for BI/interview use, plus an interactive Streamlit dashboard."
  result: "One repo covers the full analytics lifecycle — instrument, generate, analyze, dashboard, deploy — with CI (pytest + ruff), Docker, and render.yaml for one-click deploy. The typed event catalog and PII scrubbing show the discipline that separates a demo from production instrumentation."
  metrics:
    - label: "Analyses"
      value: "7"
    - label: "A/B SRM-check"
      value: "yes"
    - label: "CI"
      value: "pytest + ruff"
    - label: "Deploy"
      value: "Docker + Render"
---

# TaskFlow — PostHog Product Analytics Pipeline

## Business Context

Most analytics portfolios start with a ready-made CSV. This project starts earlier — with instrumenting an application — and goes through the whole cycle: generate traffic, capture events, analyze, dashboard, and deploy.

## Pipeline

```
app/                Demo SaaS (FastAPI + Jinja2): routes + server-side capture
  analytics/        typed event catalog · PostHog wrapper (PII scrub) · feature flag
scripts/            simulate_events.py — 30 days of realistic funnel traffic
analysis/           funnel · cohort · A/B · revenue/LTV · time-to-convert · feature-usage · SQL
dashboard/          interactive Streamlit dashboard
```

## What it demonstrates

- **Instrumentation:** a typed event catalog as the single source of truth; server-side capture; PII scrubbing.
- **A/B:** feature flag → onboarding variant; chi-square, uplift, Wilson CI, SRM check.
- **Metrics:** funnel, Day-N cohort retention, time-to-convert, revenue/LTV, first-feature → upgrade.
- **SQL mirror:** the same metrics as SQL — a reference for BI and interviews.
- **Engineering:** pytest + ruff in CI, Dockerfile, render.yaml for one-click deploy.

## Insight

The value is in the completeness of the cycle. The typed event catalog and PII scrubbing are the discipline that separates production instrumentation from a demo: events are defined in one place, PII does not leak, and the metrics reproduce in both Python and SQL.

## Impact

- **Full lifecycle** — instrument → generate → analyze → dashboard → deploy in one repo.
- **7 analyses** — funnel, cohort, A/B, revenue/LTV, time-to-convert, feature-usage, SQL mirror.
- **A/B with SRM check** — chi-square + uplift + Wilson CI.
- **Production-ready** — CI, Docker, render.yaml.

## Documentation

- [GitHub → posthog-saas-analytics](https://github.com/NikitaBoyarkin/posthog-saas-analytics)