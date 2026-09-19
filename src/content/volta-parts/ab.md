---
title: "Volta — A/B Testing (KYC progress bar)"
description: "A/B-тест KYC-прогресс-бара в необанке: +5,72 пп (p<0.0001), выше MDE +5 пп, с CUPED, AA-тестом и Bonferroni. Эффект — €656K в год при ROI 44×."
part: ab
order: 2
impact:
  - "+5.72pp KYC (Z=5.82, p<0.0001), 95% CI [+3.78%, +7.66%], exceeds +5pp MDE"
  - "CUPED + AA-test (type-I=0.050) + Bonferroni (4/11 survive)"
  - "€656K/yr business impact (44× ROI)"
tools:
  - Python
  - pandas / NumPy
  - SciPy / Statsmodels
  - Matplotlib / Seaborn
github: https://github.com/NikitaBoyarkin/volta-banking
---

# Volta — A/B Testing (KYC progress bar)

## Контекст

Второй проект петли **validate**: лечит ли progress bar в KYC проблему, найденную в funnel? Ship-gated методология защищает от rollout'а статистически-значимых, но бизнес-незначимых изменений.

## Гипотеза

Progress bar в KYC поднимает конверсию завершения KYC минимум на +5pp (MDE) без SRM.

## Данные и метод

- Расчёт размера выборки под MDE = +5pp.
- SRM-проверка (sample ratio mismatch): **p = 1.00** → баланс выборок.
- Bootstrap CI + коррекция множественных сравнений (Bonferroni / Holm / BH).
- **AA-test** под H₀: type-I error = **0.050** (методология откалибрована).
- **CUPED** (control-only θ): сокращение дисперсии, sensitivity at MDE.
- Ship-gate: **p<0.05 ∧ lift ≥ MDE ∧ no SRM → ship**.

## Что нашли

- Контроль **55.8%** → лечение **61.5%**, **+5.72pp**, 95% CI **[+3.78%, +7.66%]**.
- Превышает MDE (+5pp), p<0.0001 (Z = 5.82).
- **6/11** наивно-значимых сегментов → **4/11** после Bonferroni (коррекция убирает ложные срабатывания).

## Эффект

- **KYC conversion +5.72pp** → бизнес-импакт **€656K/yr** (44× ROI на €15K dev cost).
- Методология (CUPED + AA-test + Bonferroni + ship-gate) переиспользуема для следующих экспериментов.

## Документация

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)