---
title: Product Analytics + A/B on Supabase
description: Full-stack product analytics platform — a Streamlit dashboard reading live Supabase Postgres through Row Level Security, plus an Edge Function ingest API and a concluded A/B experiment with SQL-computed conversion and a chi-square significance test.
track: product
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
private: true
related:
  - /en/projects/streamlit/
caseStudy:
  problem: "A dashboard on synthetic data proves analytics skills, but it does not show how analytics lives inside a real multi-tenant product: auth, per-tenant data isolation, an ingest path, and experiment results computed where the data lives."
  approach: "Reused the UI from streamlit-app but swapped the data layer from an in-memory generator to Supabase Postgres. RLS is enabled on every table so a user sees only their org's rows; an Edge Function validates an API key (stored as SHA-256) and inserts events via a security-definer function. Analytics live in SQL views (funnel, cohort, MRR, DAU, channel conversion) and the A/B result is computed in the DB (v_results) with the chi-square test run on top."
  result: "One repo demonstrates the full path: instrument → ingest → isolate → analyze → experiment. The concluded A/B shows control 32.1% vs treatment 37.2% (p = 0.0034), and the security model means the dashboard is safe to expose to real users, not just to run locally."
  metrics:
    - label: "A/B lift"
      value: "+5.1pp"
    - label: "p-value"
      value: "0.0034"
    - label: "RLS isolation"
      value: "all tables"
    - label: "Ingest"
      value: "Edge Function"
---

# Product Analytics + A/B on Supabase

## Business Context

Most analytics portfolios show metrics on a clean CSV. This project closes a different gap — how analytics embeds into a real multi-tenant product: auth, per-org data isolation, an event ingest path, and an experiment whose result is computed in the database, not in a notebook.

## Architecture

```
Client/seed  ── POST /functions/v1/ingest (x-api-key) ──►  Edge Function (Deno)
                                                              │
Streamlit    ◄── email/password auth + SQL (RLS-scoped) ──►  Supabase Postgres
dashboard        (supabase-py, anon key)                      analytics + experiments
```

- **Schemas:** `analytics` (organizations, api_keys, users, events, subscriptions, org_members) and `experiments` (experiments, variants, assignments, metrics).
- **Analytics in the DB:** SQL views compute funnel, cohort retention, MRR, DAU, and channel conversion (`sql/002_views.sql`) — the dashboard reshapes, it does not aggregate.
- **A/B in the DB:** `experiments.v_results` computes per-variant assigned/converted/conversion; the chi-square test runs on top in the dashboard.
- **Ingest:** the Edge Function validates an API key (SHA-256 hash, never plaintext) and inserts the event via a `security definer` function.

## Security model (RLS)

Every table has Row Level Security enabled. A user only ever sees rows of their organization — the dashboard is safe to expose to real users, not just to run locally.

## Insight

The key point: analytics is computed where the data lives. SQL views and `v_results` mean metrics and experiment results are consistent across any client that connects to the database — dashboard, BI tool, or ad-hoc SQL all see the same numbers.

## Impact

- **Full-stack path** — instrument → ingest → isolate → analyze → experiment in one repo.
- **Concluded A/B** — control 32.1% vs treatment 37.2%, **p = 0.0034** (chi-square), +5.1pp lift.
- **RLS on every table** — the dashboard is safe to expose to real users.
- **Reused UI** — the presentation layer is taken from streamlit-app; only the data layer changed.

## Documentation

- [GitHub → supabase-product-analytics](https://github.com/NikitaBoyarkin/supabase-product-analytics)