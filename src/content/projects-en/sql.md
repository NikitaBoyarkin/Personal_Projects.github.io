---
title: SQL Analytics Case Study
description: Ten end-to-end SQL case studies on a synthetic product dataset (~183k events), runnable on DuckDB with one command. Funnel, N-day retention, DAU/MAU stickiness, LTV, gaps-and-islands streaks, A/B conversion, and revenue attribution.
hero: images/sql.svg
impact:
  - 10 self-contained SQL cases (funnel → attribution)
  - DuckDB — no server, no credentials, one command
  - Regression tests with deterministic invariants per case
  - Synthetic deterministic data (seed=42, ~183k events)
tools:
  - SQL
  - DuckDB
  - Python
  - pandas / NumPy
  - pytest
github: https://github.com/NikitaBoyarkin/sql-analytics-case-study
---

# SQL Analytics Case Study

## Business Context

A take-home format: 10 end-to-end SQL cases on a synthetic product dataset. Each case is one self-contained `.sql` file with the question and approach in a leading comment. No server, no credentials — a single command builds the data and a DuckDB database.

## Data & Method

**Data model** (synthetic, seed=42, deterministic):

| Entity | Volume | Fields |
|---|---|---|
| **Users** | 20,000 signups (Jan–Jun 2024) | `channel`, `country`, `device`, `ab_variant` |
| **Events** | ~183k funnel events | `app_open → view_item → add_to_cart → checkout → purchase`, ~80k sessions |
| **Orders** | ~800 purchases | amount, product category |
| **Subscriptions** | ~240 conversions | monthly / annual plans |

Schema: `data/schema.sql`. Generator: `data/generate_data.py`. Engagement decays geometrically from signup; retention is weighted by acquisition channel — cohorts and channels show visible non-trivial differences.

**10 cases:**

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
| 09 | A/B conversion by variant | left join, `LAG` for lift |
| 10 | Revenue attribution | first-touch vs lifetime, correlated subquery |

## Quick start

```bash
uv run --with duckdb --with pandas --with numpy python data/generate_data.py   # data/analytics.duckdb
uv run --with duckdb --with pandas python run.py            # list cases
uv run --with duckdb --with pandas python run.py 1          # run case 1
uv run --with duckdb --with pandas python run.py 4 --limit 20
uv run --with duckdb --with pandas --with numpy --with pytest pytest -q   # regression tests
```

The runner prints the case question, executes the SQL against `data/analytics.duckdb`, and renders the result as a table.

## Insight

Each case covers a specific window-function pattern that shows up in real product tasks: cumulative counts, gaps-and-islands, partitioned Top-N, range-join for stickiness. Splitting the question and the SQL in one file plus regression invariants makes the cases self-checking — running `pytest` confirms the SQL keeps producing the expected metrics after any generator change.

## Impact

- **10 self-contained SQL cases** — from funnel to revenue attribution, each with its own window pattern.
- **DuckDB with no infrastructure** — one command builds data and database; no server, no credentials.
- **Per-case regression tests** — deterministic invariants protect against regressions when the generator changes.
- **Reproducible data** (seed=42) — a re-run produces an identical result.

## Documentation

- [GitHub → sql-analytics-case-study](https://github.com/NikitaBoyarkin/sql-analytics-case-study)