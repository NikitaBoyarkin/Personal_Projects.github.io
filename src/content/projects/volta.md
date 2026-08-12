---
title: Volta Neobank — Product Analytics
description: End-to-end neobank analytics narrative — funnel, A/B test, retention, segmentation. Four sequential projects on synthetic fintech data with reproducible seeded pipelines and ship-gated statistical methodology.
hero: images/volta.svg
impact:
  - +6.24pp KYC conversion (Z=6.35, p<0.0001), €716K/yr (48× ROI)
  - +9.2pp M3 retention, +€227K/yr incremental LTV
  - 4 data-driven user segments with per-segment monetization strategy
  - CUPED variance reduction + AA-test (type-I = 0.050) + Bonferroni correction
tools:
  - Python
  - pandas / NumPy
  - SciPy / Statsmodels
  - scikit-learn
  - Matplotlib / Seaborn
  - uv + ruff
github: https://github.com/NikitaBoyarkin/volta-banking
related:
  - /posts/bayesian-ab-testing/
children:
  - funnel
  - ab
  - retention
  - segmentation
caseStudy:
  problem: "Необанк терял пользователей на онбординге, но было непонятно, какой шаг критический и лечит ли его фикс. Изолированные анализы давали локальные числа без продуктовой связи."
  approach: "Четыре проекта одной петлёй discover → validate → measure → optimize: funnel нашёл KYC-бутылочное горло, A/B с CUPED + AA-test + Bonferroni валидировал progress-bar фикс под ship-gate из трёх условий (значимость ∧ lift≥MDE ∧ no SRM), retention подтвердил удержание эффекта, сегментация перевела эффект в деньги."
  result: "Фикс KYC дал +6.24pp конверсии и €716K/yr (48× ROI), эффект удержался в retention (+9.2pp M3, +€227K/yr LTV), а сегментация показала, что 12% пользователей дают 41% выручки — миграция стоит до +€310K/yr. Воспроизводимая методология защищает от rollout'а статистически-значимых, но бизнес-незначимых изменений."
  metrics:
    - label: "KYC conversion lift"
      value: "+6.24pp"
    - label: "Annual revenue"
      value: "€716K/yr"
    - label: "ROI"
      value: "48×"
    - label: "M3 retention"
      value: "+9.2pp"
---

# Volta Neobank — Product Analytics

## Business Context

«Volta» — вымышленный необанк. Четыре проекта ведут одну продуктовую петлю **discover → validate → measure → optimize**: где отток, работает ли фикс, удержался ли эффект, как монетизировать. Все данные синтетические, генерируются детерминированно (seed), воспроизводятся из кода.

## The Narrative

| # | Проект | Вопрос | Ключевой вывод |
|---|---|---|---|
| 1 | **Funnel Analysis** | Где отток в онбординге? | KYC — критическое узкое место |
| 2 | **A/B Testing** | Лечит ли progress bar проблему KYC? | +6.24pp lift, p<0.0001 → ship |
| 3 | **Retention & Cohort** | Продержался ли эффект? | +9.2pp M3 retention, +€227K/yr LTV |
| 4 | **User Segmentation** | Кто пользователи, как монетизировать? | 4 сегмента, стратегия по каждому |

## Data & Method

**Данные:** синтетические, seeded-генераторы (`generate_*.py`) → воспроизводимые CSV. Funnel-датасет закоммичен; остальные генерируются по команде.

**Методология по проектам:**

1. **Funnel** — step conversion, absolute/relative drop-off, Chi-square тест каналов. Registration теряет больше всего пользователей в абсолютных числах (2,682, 73.2% step conv); KYC Complete — наибольший относительный отток (56.6% step conv). Referral конвертирует на 11.7pp лучше paid social; iOS обгоняет Android на каждом шаге (13.6% vs 11.7% end-to-end).
2. **A/B (KYC progress bar)** — расчёт размера выборки, SRM-проверка (p=1.00), bootstrap CI, коррекция множественных сравнений (Bonferroni/Holm/BH), AA-test под H₀ (type-I = 0.050), CUPED (control-only θ), sensitivity at MDE. Контроль 55.8% → лечение 62.1%, **+6.24pp**, 95% CI [+4.26%, +8.16%], превышает +5pp MDE. Ship-gate: p<0.05 ∧ lift≥MDE ∧ no SRM → ship. 9/11 наивно-значимых сегментов, 4/11 после Bonferroni.
3. **Retention** — когортные кривые, pre/post Welch t-test + Cohen's d, plan-specific LTV (ARPU × retention decomposition). M1 retention +10pp step-change, M3 +9.2pp.
4. **Segmentation** — StandardScaler + KMeans, data-driven K (marginal-gain elbow, силуэтный plateau K=2–4, коллапс при K=5). Сегменты: Power 12% / Growth 24% / Casual 32% / Dormant 32%. Lorenz: 12% пользователей → 41% выручки; 68% → 92%. Сценарии миграции: +€26K/mo (€310K/yr).

**Структура кода:** общие `utils/common.py` (`setup()`, `print_section()`, `CONSTANTS`, `data_path()`), `functions + main()` — импорт модуля не запускает анализ. Excel-отчёты через `openpyxl`.

## Insight

Петля из четырёх проектов ценнее изолированных анализов: фикс KYC, найденный в funnel, валидирован в A/B, подтверждён в retention и переведён в деньги через сегментацию. Ключевое — ship-gate с тремя условиями (значимость ∧ lift≥MDE ∧ no SRM) защищает от rollout'а статистически-значимых, но бизнес-незначимых изменений; CUPED и AA-test сокращают дисперсию и верифицируют уровень ошибок до запуска.

## Impact

- **KYC conversion +6.24pp** (p<0.0001, превышает MDE) → бизнес-импакт **€716K/yr** (48× ROI на €15K dev cost).
- **M3 retention +9.2pp** → **+€227K/yr** incremental LTV от KYC-фикса.
- **4 сегмента** с per-segment стратегией и монетизацией до **+€310K/yr** через миграцию.
- **Воспроизводимая методология** — CUPED, AA-test, Bonferroni, sensitivity at MDE; 4 рекомендованных A/B для валидации стратегии.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)