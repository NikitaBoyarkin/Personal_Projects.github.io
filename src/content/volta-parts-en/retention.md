---
title: "Volta — Retention & Cohort"
description: "Volta retention & cohort — did the KYC fix hold? +10pp M1 and +9.2pp M3 retention step-change; +€227K/yr incremental LTV via ARPU × retention decomposition."
part: retention
order: 3
impact:
  - "M1 +10pp, M3 +9.2pp retention step-change"
  - "+€227K/yr incremental LTV"
tools:
  - Python
  - pandas / NumPy
  - SciPy / Statsmodels
  - Matplotlib / Seaborn
github: https://github.com/NikitaBoyarkin/volta-banking
---

# Volta — Retention & Cohort

## Business Context

The third project in the **measure** loop: did the KYC fix's effect hold over time? In-the-moment conversion is not enough — retention is required.

## Hypothesis

The MDE-exceeding lift in KYC conversion persists as +retention at M1 and M3.

## Data & Method

- Cohort retention curves pre/post.
- **Welch t-test** + **Cohen's d** for the cohort difference.
- Plan-specific LTV via **ARPU × retention decomposition**.

## Insight

- **M1 retention: +10pp** step-change.
- **M3 retention: +9.2pp** — the effect does not fade.
- LTV grows through retention decomposition, not only ARPU.

## Impact

- **+€227K/yr** incremental LTV from the KYC fix — the effect is validated over time, not only at the A/B moment.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)