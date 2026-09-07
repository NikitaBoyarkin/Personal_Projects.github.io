---
title: Volta Neobank — Product Analytics
description: "End-to-end neobank analytics narrative — 17 projects across 12 analytical domains + Market & Jobs: funnel, A/B, retention, segmentation, churn, RFM, CLV, attribution, anomaly, spend, NPS, JTBD, unit economics, upsell, referral. Synthetic fintech data, reproducible seeded pipelines, ship-gated statistical methodology."
track: experiments
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
date: 2026-08-11
faq:
  - question: "Где отток в онбординге?"
    answer: "KYC — критическое узкое место: наибольший относительный отток (56.6% step conversion)."
  - question: "Лечит ли progress bar проблему KYC?"
    answer: "Да: +6.24pp lift (p<0.0001), 95% CI [+4.26%, +8.16%], превышает MDE +5pp → ship."
  - question: "Продержался ли эффект?"
    answer: "Да: +9.2pp M3 retention, +€227K/yr incremental LTV."
  - question: "Кто пользователи, как монетизировать?"
    answer: "4 сегмента (Power 12% / Growth 24% / Casual 32% / Dormant 32%) с per-segment стратегией; миграция до +€310K/yr."
demo: demos/bayesian/index.html
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

## Дело

«Volta» — вымышленный необанк, который терял пользователей на онбординге. Маркетинг видел трафик, продукт — активацию, поддержка — тикеты. Каждый отдел — свою цифру, и ни одна не объясняла, где утекают деньги. Мы начали с одного вопроса: **какой шаг онбординга критический?**

Ответ искали четырьмя проектами одной петлёй **discover → validate → measure → optimize**. Каждый проект — улика, которая сужает круг. Все данные синтетические, генерируются детерминированно (seed) и воспроизводятся из кода: любой вывод можно перепроверить перезапуском, а не «поверить на слово».

## Улика №1 — Воронка: где теряем

Первая улика — воронка онбординга до первого продуктивного действия. Главная утечка оказалась в **KYC** — этапе верификации: наибольший относительный отток (56.6% step conversion). Регистрация теряет больше в абсолютных числах (2 682 пользователя, 73.2% step conv), но KYC дороже: пользователь уже прошёл половину пути и всё равно уходит.

Гипотеза: слишком длинная форма и отсутствие промежуточного подтверждения.

→ [Funnel Analysis — досье](/projects/volta/funnel/)

## Улика №2 — A/B: лечит ли фикс

Срез — не доказательство: находку воронки проверили как эксперимент, а не как срез. Гипотеза: разбить KYC на шаги с прогресс-баром.

Схема теста:

- **CUPED** с ковариатом «число сессий до теста» — убрали часть шума, выборка не росла
- **AA-тест** перед запуском: Type I error = 0.050 — метод не мнит значимость
- **Bonferroni** для нескольких метрик — контроль множественности
- **Ship-gate**: релиз только если значимость ∧ lift ≥ MDE ∧ no SRM

Вердикт: контроль 55.8% → лечение 62.1%, **+6.24pp**, p < 0.0001, 95% CI [+4.26%, +8.16%], превышает MDE +5pp → **ship**. При реалистичной аудитории это ≈ **€716K/год** при ROI 48×.

→ [A/B Testing — досье](/projects/volta/ab/)

## Улика №3 — Retention: держится ли эффект

Ship — не конец: эффект проверили на удержании, когортными треугольниками (месяц регистрации × возраст) вместо «среднего по всем». По диагонали видно: когорты с включённым новым онбордингом держат **M3-удержание на +9.2pp** относительно старых когорт → **+€227K/год инкрементального LTV**. Новый онбординг улучшает и первую неделю (быстрее доходят до ценности), и 3-й месяц (меньше отток после «медового месяца»). Без треугольников этот вывод спрятался бы за средним.

→ [Retention & Cohort — досье](/projects/volta/retention/)

## Улика №4 — Сегментация: кто платит

Эффект удержался — остался вопрос, кто эти пользователи и как их монетизировать. StandardScaler + KMeans, data-driven K: **4 сегмента** — Power 12% / Growth 24% / Casual 32% / Dormant 32%. Lorenz: 12% пользователей дают 41% выручки; 68% → 92%. Сценарии миграции: до **+€310K/год**.

→ [User Segmentation — досье](/projects/volta/segmentation/)

## Вердикт

Петля из четырёх проектов ценнее изолированных анализов: фикс KYC, найденный в воронке, валидирован в A/B, подтверждён в retention и переведён в деньги через сегментацию. Соль — **ship-gate с тремя условиями** (значимость ∧ lift ≥ MDE ∧ no SRM): он защищает от rollout'а статистически-значимых, но бизнес-незначимых изменений. Порядок важнее цифр: сначала калибровка инструмента (AA-тест, CUPED), потом вывод.

## Досье: расширение репозитория

Репозиторий вырос с 4 core-проектов до **17** (12 аналитических доменов + Market & Jobs). Дополнительные проекты:

| # | Проект | Ключевой вывод |
|---|---|---|
| 5 | **Churn Prediction** | RF +0.03 ROC-AUC над LR; топ-драйвер — неактивность |
| 6 | **RFM Analysis** | 6 lifecycle-сегментов |
| 7 | **CLV Modeling** | 3 метода: historical / retention-curve / Gamma-Gamma |
| 8 | **Marketing Attribution** | First/last/linear/Shapley — referral лидирует |
| 9 | **Anomaly Detection** | Z-score/IQR/Isolation Forest, скоринг vs ground truth |
| 10 | **Spend Analysis** | Категории/каналы, decline rate, месячный тренд |
| 11 | **Support & Churn** | Churn по тикетам, unresolved, CSAT-бэнды |
| 12 | **NPS Trends** | Месячный NPS, драйверы, промоутер-микс |
| 13 | **JTBD × Cohorts** | Dormant = UX-трение (Digital Newcomers 45+), не «нет задачи» |
| 14 | **Unit Economics** | Travelers теряют €/tx; break-even при FX 1.0%→0.55% |
| 15 | **Premium Upsell** | Anchor 17% vs Digital Newcomers 45+ 2% — ценность не ложится |
| 16 | **45+ KYC Deep-Dive** | 45+ lift +0.6pp (ns) vs 35-44 +10pp — трение = доверие, не UX |
| 17 | **Referral Segments** | Anchor 29.6% vs Digital Newcomers 4.8% — не переносится |

## Data & Method

**Данные:** синтетические, seeded-генераторы (`generate_*.py`) → воспроизводимые CSV. Funnel-датасет закоммичен; остальные генерируются по команде.

**Методология по проектам:**

1. **Funnel** — step conversion, absolute/relative drop-off, Chi-square тест каналов. Registration теряет больше всего пользователей в абсолютных числах (2,682, 73.2% step conv); KYC Complete — наибольший относительный отток (56.6% step conv). Referral конвертирует на 11.7pp лучше paid social; iOS обгоняет Android на каждом шаге (13.6% vs 11.7% end-to-end).
2. **A/B (KYC progress bar)** — расчёт размера выборки, SRM-проверка (p=1.00), bootstrap CI, коррекция множественных сравнений (Bonferroni/Holm/BH), AA-test под H₀ (type-I = 0.050), CUPED (control-only θ), sensitivity at MDE. Контроль 55.8% → лечение 62.1%, **+6.24pp**, 95% CI [+4.26%, +8.16%], превышает +5pp MDE. Ship-gate: p<0.05 ∧ lift≥MDE ∧ no SRM → ship. 9/11 наивно-значимых сегментов, 4/11 после Bonferroni.
3. **Retention** — когортные кривые, pre/post Welch t-test + Cohen's d, plan-specific LTV (ARPU × retention decomposition). M1 retention +10pp step-change, M3 +9.2pp.
4. **Segmentation** — StandardScaler + KMeans, data-driven K (marginal-gain elbow, силуэтный plateau K=2–4, коллапс при K=5). Сегменты: Power 12% / Growth 24% / Casual 32% / Dormant 32%. Lorenz: 12% пользователей → 41% выручки; 68% → 92%. Сценарии миграции: +€26K/mo (€310K/yr).

**Структура кода:** общие `utils/common.py` (`setup()`, `print_section()`, `CONSTANTS`, `data_path()`), `functions + main()` — импорт модуля не запускает анализ. Excel-отчёты через `openpyxl`.

## Impact

- **KYC conversion +6.24pp** (p<0.0001, превышает MDE) → бизнес-импакт **€716K/yr** (48× ROI на €15K dev cost).
- **M3 retention +9.2pp** → **+€227K/yr** incremental LTV от KYC-фикса.
- **4 сегмента** с per-segment стратегией и монетизацией до **+€310K/yr** через миграцию.
- **Воспроизводимая методология** — CUPED, AA-test, Bonferroni, sensitivity at MDE; 4 рекомендованных A/B для валидации стратегии.
- **17 проектов** — 12 аналитических доменов + Market & Jobs (JTBD): от funnel до referral-сегментов.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)
