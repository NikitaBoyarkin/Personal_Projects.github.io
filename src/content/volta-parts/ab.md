---
title: "Volta — A/B Testing (KYC progress bar)"
description: "Volta A/B test — KYC progress bar. +6.24pp lift (Z=6.35, p<0.0001) exceeding the +5pp MDE, with CUPED variance reduction, AA-test calibration (type-I=0.050) and Bonferroni correction. €716K/yr impact."
part: ab
order: 2
impact:
  - "+6.24pp KYC (Z=6.35, p<0.0001), 95% CI [+4.26%, +8.16%], exceeds +5pp MDE"
  - "CUPED + AA-test (type-I=0.050) + Bonferroni (4/11 survive)"
  - "€716K/yr business impact (48× ROI)"
tools:
  - Python
  - pandas / NumPy
  - SciPy / Statsmodels
  - Matplotlib / Seaborn
github: https://github.com/NikitaBoyarkin/volta-banking
---

# Volta — A/B Testing (KYC progress bar)

## Business Context

Второй проект петли **validate**: лечит ли progress bar в KYC проблему, найденную в funnel? Ship-gated методология защищает от rollout'а статистически-значимых, но бизнес-незначимых изменений.

## Hypothesis

Progress bar в KYC поднимает конверсию завершения KYC минимум на +5pp (MDE) без SRM.

## Data & Method

- Расчёт размера выборки под MDE = +5pp.
- SRM-проверка (sample ratio mismatch): **p = 1.00** → баланс выборок.
- Bootstrap CI + коррекция множественных сравнений (Bonferroni / Holm / BH).
- **AA-test** под H₀: type-I error = **0.050** (методология откалибрована).
- **CUPED** (control-only θ): сокращение дисперсии, sensitivity at MDE.
- Ship-gate: **p<0.05 ∧ lift ≥ MDE ∧ no SRM → ship**.

## Insight

- Контроль **55.8%** → лечение **62.1%**, **+6.24pp**, 95% CI **[+4.26%, +8.16%]**.
- Превышает MDE (+5pp), p<0.0001 (Z = 6.35).
- **9/11** наивно-значимых сегментов → **4/11** после Bonferroni (коррекция убирает ложные срабатывания).

## Impact

- **KYC conversion +6.24pp** → бизнес-импакт **€716K/yr** (48× ROI на €15K dev cost).
- Методология (CUPED + AA-test + Bonferroni + ship-gate) переиспользуема для следующих экспериментов.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)