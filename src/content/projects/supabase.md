---
title: Product Analytics + A/B on Supabase
description: Full-stack product analytics platform — a Streamlit dashboard reading live Supabase Postgres through Row Level Security, plus an Edge Function ingest API and a concluded A/B experiment with SQL-computed conversion and a chi-square significance test.
hero: images/supabase.svg
impact:
  - "Full-stack: Streamlit UI + Supabase Postgres + Edge Function ingest (API-key auth)"
  - Row Level Security on every table — a user sees only their org's rows
  - SQL views compute funnel, cohort, MRR, DAU, channel conversion — the dashboard reshapes, it does not aggregate
  - "A/B result in the DB: control 32.1% vs treatment 37.2%, p = 0.0034 (chi-square)"
tools:
  - Python
  - Streamlit
  - Supabase (Postgres + RLS + Edge Functions)
  - SQL
  - supabase-py
github: https://github.com/NikitaBoyarkin/supabase-product-analytics
related:
  - /projects/streamlit/
caseStudy:
  problem: "Дашборд на синтетических данных доказывает аналитические навыки, но не показывает, как аналитика живёт внутри реального multi-tenant продукта: аутентификация, изоляция данных по тенантам, путь инжеста и экспериментальные результаты, считающиеся там же, где лежат данные."
  approach: "Переиспользовал UI из streamlit-app, но заменил слой данных: вместо генератора в памяти — Supabase Postgres. На каждой таблице включён RLS, пользователь видит только строки своей организации; Edge Function валидирует API-ключ (хранится как SHA-256) и вставляет события через security-definer функцию. Аналитика живёт в SQL-views (funnel, cohort, MRR, DAU, channel conversion), а результат A/B считается прямо в базе (v_results) — χ²-тест запускается поверх."
  result: "Один репозиторий демонстрирует весь путь: instrument → ingest → isolate → analyze → experiment. Завершённый A/B даёт control 32.1% vs treatment 37.2% (p = 0.0034), а модель безопасности означает, что дашборд безопасно показывать реальным пользователям, а не только запускать локально."
  metrics:
    - label: "A/B lift"
      value: "+5.1pp"
    - label: "p-value"
      value: "0.0034"
    - label: "RLS-изоляция"
      value: "все таблицы"
    - label: "Ingest"
      value: "Edge Function"
---

# Product Analytics + A/B on Supabase

## Business Context

Аналитическое портфолио чаще всего показывает метрики на чистом CSV. Этот проект закрывает другой сценарий — как аналитика встраивается в реальный multi-tenant продукт: авторизация, изоляция данных по организациям, путь инжеста событий и эксперимент, результат которого считается в базе, а не в ноутбуке.

## Architecture

```
Client/seed  ── POST /functions/v1/ingest (x-api-key) ──►  Edge Function (Deno)
                                                              │
Streamlit    ◄── email/password auth + SQL (RLS-scoped) ──►  Supabase Postgres
dashboard        (supabase-py, anon key)                      analytics + experiments
```

- **Схемы:** `analytics` (organizations, api_keys, users, events, subscriptions, org_members) и `experiments` (experiments, variants, assignments, metrics).
- **Аналитика в БД:** SQL-views считают funnel, cohort retention, MRR, DAU и channel conversion (`sql/002_views.sql`) — дашборд переформатирует, но не агрегирует.
- **A/B в БД:** `experiments.v_results` считает по варианту assigned/converted/conversion; χ²-тест запускается поверх в дашборде.
- **Ingest:** Edge Function валидирует API-ключ (SHA-256 hash, не plaintext) и вставляет событие через `security definer` функцию.

## Security model (RLS)

На каждой таблице включён Row Level Security. Пользователь видит только строки своей организации — дашборд безопасно открывать реальным пользователям, а не только запускать локально.

## Insight

Ключевое — аналитика считается там же, где лежат данные. SQL-views и `v_results` означают, что метрики и экспериментальные результаты согласованы между любым клиентом, который подключается к базе: дашборд, BI-инструмент или ad-hoc SQL-запрос видят одни и те же цифры.

## Impact

- **Full-stack путь** — instrument → ingest → isolate → analyze → experiment в одном репозитории.
- **Завершённый A/B** — control 32.1% vs treatment 37.2%, **p = 0.0034** (χ²), +5.1pp lift.
- **RLS на всех таблицах** — дашборд безопасно показывать реальным пользователям.
- **Переиспользованный UI** — слой презентации взят из streamlit-app; заменён только слой данных.

## Documentation

- [GitHub → supabase-product-analytics](https://github.com/NikitaBoyarkin/supabase-product-analytics)