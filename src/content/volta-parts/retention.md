---
title: "Volta — Retention & Cohort"
description: "Когортное удержание после фикса KYC: M1 +10 пп и M3 +9,2 пп, +€227K в год инкрементального LTV. Step-change видно по когортам, а не по среднему."
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

Третий проект петли **measure**: продержался ли эффект KYC-фикса во времени? Конверсия в моменте — недостаточно; нужно удержание.

## Hypothesis

MDE-превышающий lift в KYC-конверсии сохраняется как +retention на M1 и M3.

## Data & Method

- Когортные кривые удержания pre/post.
- **Welch t-test** + **Cohen's d** для разницы когорт.
- Plan-specific LTV через **ARPU × retention decomposition**.

## Insight

- **M1 retention: +10pp** step-change.
- **M3 retention: +9.2pp** — эффект не выцветает.
- LTV растёт за счёт retention-decomposition, не только ARPU.

## Impact

- **+€227K/yr** incremental LTV от KYC-фикса — эффект валидирован во времени, не только в моменте A/B.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)