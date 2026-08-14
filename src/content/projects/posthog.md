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
  - /projects/supabase/
caseStudy:
  problem: "Product-аналитику обычно показывают на очищенном CSV. Трудная часть — инструментировать реальное приложение, ловить правильные события без утечек PII, попадать в аналитический инструмент и превращать сырые события в решения — остаётся невидимой."
  approach: "Собрал демо-SaaS (FastAPI + Jinja2) с server-side PostHog-capture поверх типизированного каталога событий (единственный источник правды), обёртки PostHog, скрабящей PII, и feature-flag, управляющего A/B-вариантом онбординга. Симулятор генерирует 30 дней реалистичного funnel-трафика; скрипты анализа превращают события в funnel, cohort retention, A/B (chi-square + uplift + Wilson CI + SRM check), revenue/LTV, time-to-convert и feature-usage → upgrade. Те же метрики записаны как SQL для BI/interview, плюс интерактивный Streamlit-дашборд."
  result: "Один репозиторий покрывает весь lifecycle аналитики — instrument, generate, analyze, dashboard, deploy — с CI (pytest + ruff), Docker и render.yaml для one-click deploy. Типизированный каталог событий и скрабинг PII показывают дисциплину, отличающую демо от production-инструментации."
  metrics:
    - label: "Анализов"
      value: "7"
    - label: "A/B SRM-check"
      value: "да"
    - label: "CI"
      value: "pytest + ruff"
    - label: "Deploy"
      value: "Docker + Render"
---

# TaskFlow — PostHog Product Analytics Pipeline

## Business Context

Большинство аналитических портфолио начинаются с готового CSV. Этот проект начинается раньше — с инструментирования приложения — и проходит весь цикл: генерация трафика, захват событий, анализ, дашборд и деплой.

## Pipeline

```
app/                Demo SaaS (FastAPI + Jinja2): routes + server-side capture
  analytics/        typed event catalog · PostHog wrapper (PII scrub) · feature flag
scripts/            simulate_events.py — 30 days of realistic funnel traffic
analysis/           funnel · cohort · A/B · revenue/LTV · time-to-convert · feature-usage · SQL
dashboard/          interactive Streamlit dashboard
```

## What it demonstrates

- **Инструментирование:** типизированный каталог событий как единый источник правды; server-side capture; скрабинг PII.
- **A/B:** feature-flag → вариант онбординга; chi-square, uplift, Wilson CI, проверка SRM.
- **Метрики:** funnel, Day-N cohort retention, time-to-convert, revenue/LTV, first-feature → upgrade.
- **SQL-зеркало:** те же метрики как SQL — референс для BI и собеседований.
- **Инженерка:** pytest + ruff в CI, Dockerfile, render.yaml для one-click deploy.

## Insight

Ценность — в полноте цикла. Типизированный каталог событий и скрабинг PII — это та дисциплина, которая отличает production-инструментацию от демо: события определены в одном месте, PII не утекает, а метрики воспроизводимы и в Python, и в SQL.

## Impact

- **Полный lifecycle** — instrument → generate → analyze → dashboard → deploy в одном репо.
- **7 анализов** — funnel, cohort, A/B, revenue/LTV, time-to-convert, feature-usage, SQL-зеркало.
- **A/B с SRM-check** — chi-square + uplift + Wilson CI.
- **Production-готовность** — CI, Docker, render.yaml.

## Documentation

- [GitHub → posthog-saas-analytics](https://github.com/NikitaBoyarkin/posthog-saas-analytics)