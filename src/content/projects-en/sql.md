---
title: SQL Analytics Case Study
description: 25 end-to-end SQL case studies on a synthetic product dataset (~183k events), runnable on DuckDB with one command. Funnel, retention, LTV, streaks, A/B, attribution, sessionization, lifecycle, churn, Pareto, anomaly detection, RFM. Live report published to GitHub Pages.
track: analytics
hero: images/sql.svg
impact:
  - 25 self-contained SQL cases (funnel → RFM)
  - DuckDB — no server, no credentials, one command
  - Regression tests with deterministic invariants per case
  - Synthetic deterministic data (seed=42 + additive seed=43)
  - Live interactive report on GitHub Pages
tools:
  - SQL
  - DuckDB
  - Python
  - pandas / NumPy
  - pytest
github: https://github.com/NikitaBoyarkin/sql-analytics-case-study
updated: 2026-09-15
demo: https://nikitaboyarkin.github.io/sql-analytics-case-study/
---

# SQL Analytics Case Study

## Business Context

A take-home format: 25 end-to-end SQL cases on a synthetic product dataset. Each case is one self-contained `.sql` file with the question and approach in a leading comment. No server, no credentials — a single command builds the data and a DuckDB database.

## Data & Method

**Data model** (synthetic, seed=42, deterministic):

| Entity | Volume | Fields |
|---|---|---|
| **Users** | 20,000 signups (Jan–Jun 2024) | `channel`, `country`, `device`, `ab_variant` |
| **Events** | ~183k funnel events | `app_open → view_item → add_to_cart → checkout → purchase`, ~80k sessions |
| **Orders** | 928 purchases | amount, product category |
| **Subscriptions** | 268 conversions | monthly / annual plans |
| **Cancellations** (seed=43) | 98 | `subscription_cancellations` |
| **Refunds** (seed=43) | 53 | `refunds` |

Schema: `data/schema.sql`. Generator: `data/generate_data.py`. Engagement decays geometrically from signup; retention is weighted by acquisition channel. Additive tables (cases 21–25) are generated on a separate RNG stream (seed=43) so the seed-42 numbers in cases 1–20 never move.

**25 cases:**

| # | Case | Technique |
|---|---|---|
| 01 | Funnel conversion | cumulative counts, `LAG` / `FIRST_VALUE` |
| 02 | N-day retention by cohort | `DATE_TRUNC('month', signup_date)` |
| 03 | Rolling 30-day retention | `EXISTS` subqueries per window |
| 04 | DAU / MAU / stickiness | trailing-28d range join |
| 05 | LTV by cohort | left join + `COALESCE` for zero-revenue |
| 06 | Top-N categories per country | `ROW_NUMBER() OVER (PARTITION BY ...)` |
| 07 | Cumulative revenue | `SUM() ... UNBOUNDED PRECEDING` |
| 08 | Longest active-day streak | gaps-and-islands (`row_number` → island key) |
| 09 | A/B conversion by variant | in-SQL z-test + p-value (Abramowitz–Stegun) |
| 10 | Revenue attribution | first-touch vs lifetime, correlated subquery |
| 11 | 7-day moving average of DAU | `AVG() OVER (... ROWS BETWEEN 6 PRECEDING ...)` |
| 12 | Top-2 revenue users per country | `QUALIFY` |
| 13 | Monthly revenue by category | `PIVOT` long → wide |
| 14 | Subscription MRR | recursive CTE (billing rows per subscription) |
| 15 | Order amount distribution | `MEDIAN`, `QUANTILE_CONT` (p90/p99) |
| 16 | Sessionization + session depth | gaps-and-islands on timestamps, validation vs ground truth |
| 17 | Weekly lifecycle (new/returning/resurrecting/dormant) | state transitions, `LAG`/`LEAD` |
| 18 | Cohort revenue retention (triangle) | months-since-signup, % of period-0 |
| 19 | Repeat purchase & time between orders | `LAG` within user |
| 20 | RFM segmentation | `NTILE` quintiles, segment-score rules |
| 21 | Subscription churn (logo & MRR) | monthly churn, `FILTER` aggregates |
| 22 | Refunds & net revenue | left join, gross-vs-net |
| 23 | Pareto / revenue concentration | `NTILE(10)`, cumulative-share curve |
| 24 | Daily revenue anomaly detection | robust MAD z-score, rolling baseline |
| 25 | Purchase → subscription conversion | join to subscriptions, time-to-convert |

## Quick start

```bash
uv run python data/generate_data.py   # data/analytics.duckdb
uv run python run.py            # list cases
uv run python run.py 1          # run case 1
uv run python run.py 9 --limit 20
uv run --extra dev pytest -q    # 41 regression tests
uv run python scripts/report.py # reports/index.html
```

The runner prints the case question, executes the SQL against `data/analytics.duckdb`, and renders the result as a table. The charted report is published to GitHub Pages automatically on every push.

## Insight

Each case covers a specific window-function pattern that shows up in real product tasks. The findings are honest rather than engineered: the repeat rate is just 3.5% (896 buyers, 31 repeat) — this is a one-and-done purchase engine; RFM degenerates into a recency story; the top decile delivers only 22% of revenue (no whales); logo churn climbs to ~15%/month even as MRR compounds. Splitting question and SQL in one file plus regression invariants makes the cases self-checking.

## Impact

- **25 self-contained SQL cases** — from funnel to RFM, each with its own window pattern.
- **Sessionization with validation** — a 30-min gap reproduces 80k pre-assigned sessions at 99.6% fidelity.
- **Additive data without breaking golden answers** — seed=43 on a separate RNG stream.
- **DuckDB with no infrastructure** — one command builds data and database.
- **Per-case regression tests** — 41 tests (invariants + golden answers) keep `cases.md` and the code in sync.
- **Live report** — GitHub Pages refreshes on every push.

## Documentation

- [Live report → nikitaboyarkin.github.io/sql-analytics-case-study](https://nikitaboyarkin.github.io/sql-analytics-case-study/)
- [GitHub → sql-analytics-case-study](https://github.com/NikitaBoyarkin/sql-analytics-case-study)