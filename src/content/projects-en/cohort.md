---
title: Cohort Analysis Dashboard
description: Cohort retention and LTV analysis on synthetic data — retention curves, churn patterns, and revenue/LTV by acquisition cohort. Python pipeline (pandas + matplotlib/seaborn) plus a Tableau-ready export with CSV and Hyper extract.
track: analytics
hero: images/cohort.svg
impact:
  - Cohort retention matrix with triangular decay
  - ARPU / LTV by cohort with proper observation-age caveat
  - Tableau-ready export (CSV + .hyper extract)
  - Reproducible seeded pipeline (seed=42)
tools:
  - Python
  - pandas
  - matplotlib / seaborn
  - Jupyter Notebook
  - Tableau (Hyper API)
github: https://github.com/NikitaBoyarkin/tableau_cohort_analysis
related:
  - /posts/cohort-retention-guide/
---

# Cohort Analysis Dashboard

## Business Context

Cohort retention and LTV analysis on synthetic data: user retention, churn curves, and revenue/LTV by acquisition cohort. A Python pipeline (pandas + matplotlib/seaborn) plus an export ready to load into Tableau. Data is synthetic, deterministic (seed=42), reproduced from code.

## Hypothesis

If we split users into cohorts by first-activation month and build a retention matrix + retention curves + ARPU/LTV, the churn speed per cohort becomes visible, along with where monetization drops faster than retention.

## Data & Method

**Data model** — one row = "user × observation month":

| Field | Type | Description |
|---|---|---|
| `user_id` | int | user identifier |
| `cohort_month` | date | arrival month (derived from `join_date`, not a separate field) |
| `join_date` | date | registration date (first of month) |
| `period` | int | months since arrival (0 = registration month) |
| `is_active` | int 0/1 | active in this month |
| `revenue` | int | revenue for the month (0 if inactive) |

`cohort_month` is derived from `join_date`, as in real production. Younger cohorts have fewer observed months — the retention matrix is triangular.

**Methodology:**

- **Period 0 = 100% retention** by definition (all active in arrival month). The curve decays from period 1: `retention(p) = 0.85 · 0.75^(p-1)`.
- **Revenue:** active month → `Poisson(λ=10)`; inactive → 0.
- **Cohort sizes** — count of unique `user_id` where `period == 0`.
- **ARPU** — average revenue per cohort user; **LTV** — cumulative ARPU over periods.

**Functions:** `cohort_sizes()` (monthly inflow), `retention_matrix()` (matrix + curves), `revenue_by_cohort()` (ARPU/LTV).

**Tableau export** (`tableau_export.py`) creates in `tableau/`:
- `cohort_export.csv` — flat shape for Tableau (adds `cohort_label` and `period_date` — the calendar observation month);
- `cohort_extract.hyper` — a Tableau Hyper extract via the official Hyper API.

**Tableau heatmap:** Columns = `period`, Rows = `cohort_label`, Marks = Square, Color = AVG(`is_active`), Text = `% of Total` per row.

## Insight

The cohort view matters more than average retention: it shows not only churn speed but also monetization compared to retention. LTV of younger cohorts is understated due to short history — compare LTV correctly only at equal cohort "age." Key improvements: `cohort_month` is derived from `join_date` (not a separate random field), period 0 = 100% by convention, and NaNs are masked in the heatmap instead of rendering `nan%`.

## Impact

- **Cohort retention matrix** with triangular decay — shows the month a cohort loses activity.
- **ARPU / LTV by cohort** with a correct observation-age caveat.
- **Tableau-ready export** — CSV + `.hyper` extract, with a view-build instruction.
- **Reproducible pipeline** — `uv` + `pyproject.toml` + `.python-version`, seed=42.

## Documentation

- [GitHub → tableau_cohort_analysis](https://github.com/NikitaBoyarkin/tableau_cohort_analysis)