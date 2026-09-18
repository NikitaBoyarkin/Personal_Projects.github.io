---
title: SQL Analytics Case Study
description: "25 SQL-кейсов на синтетическом датасете (~183k событий): воронка, retention, LTV, атрибуция, аномалии. Запуск на DuckDB одной командой, живой отчёт на GitHub Pages."
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
caseStudy:
  problem: "Аналитику нужно показать владение SQL на продуктовых задачах, но продакшен-данных нет, а учебные задачи не демонстрируют системное мышление. Как доказать, что SQL — рабочий инструмент, а не набор заученных синтаксисов?"
  approach: "25 end-to-end кейсов на синтетическом датасете (seed=42, ~183k событий, 20k signups): каждый кейс — один самодостаточный .sql файл с вопросом и подходом в leading-комментарии. DuckDB — одна команда строит данные и базу, без сервера и кредов. Regression-тесты с детерминированными инвариантами защищают SQL от регрессий. Второй батч (churn, refunds, Pareto, anomaly detection, upsell conversion) добавлен на отдельном RNG-потоке (seed=43) — числа первых 20 кейсов не изменились."
  result: "25 кейсов от funnel до RFM: sessionization с валидацией против ground truth (99.6%), lifecycle-композиция, revenue-retention-треугольник, in-SQL z-test для A/B, MAD-анализ аномалий. Кейсы самопроверяемы: pytest подтверждает, что SQL продолжает давать ожидаемые метрики после любого изменения данных. Отчёт публикуется на GitHub Pages автоматически."
  metrics:
    - label: "SQL-кейсов"
      value: "25"
    - label: "Событий в датасете"
      value: "~183k"
    - label: "Signups"
      value: "20k"
    - label: "Тестов (regression)"
      value: "41"
---

# SQL Analytics Case Study

## Business Context

Take-home–формат: 25 end-to-end SQL-кейсов на синтетическом продуктовом датасете. Каждый кейс — один самодостаточный `.sql` файл с вопросом и подходом в leading-комментарии. Без сервера, без кредов — одна команда строит данные и базу DuckDB.

## Data & Method

**Модель данных** (синтетическая, seed=42, детерминированная):

| Сущность | Объём | Поля |
|---|---|---|
| **Users** | 20,000 signups (Jan–Jun 2024) | `channel`, `country`, `device`, `ab_variant` |
| **Events** | ~183k funnel-событий | `app_open → view_item → add_to_cart → checkout → purchase`, ~80k sessions |
| **Orders** | 928 покупок | amount, product category |
| **Subscriptions** | 268 конверсий | monthly / annual plans |
| **Cancellations** (seed=43) | 98 | `subscription_cancellations` |
| **Refunds** (seed=43) | 53 | `refunds` |

Схема: `data/schema.sql`. Генератор: `data/generate_data.py`. Engagement геометрически убывает от signup; retention взвешен каналом привлечения. Аддитивные таблицы (кейсы 21–25) генерируются на отдельном RNG-потоке (seed=43) — числа кейсов 1–20 не меняются.

**25 кейсов:**

| # | Кейс | Техника |
|---|---|---|
| 01 | Funnel conversion | cumulative counts, `LAG` / `FIRST_VALUE` |
| 02 | N-day retention by cohort | `DATE_TRUNC('month', signup_date)` |
| 03 | Rolling 30-day retention | `EXISTS` subqueries per window |
| 04 | DAU / MAU / stickiness | trailing-28d range join |
| 05 | LTV by cohort | left join + `COALESCE` для zero-revenue |
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
| 16 | Sessionization + session depth | gaps-and-islands на timestamps, валидация vs ground truth |
| 17 | Weekly lifecycle (new/returning/resurrecting/dormant) | state transitions, `LAG`/`LEAD` |
| 18 | Cohort revenue retention (triangle) | months-since-signup, % of period-0 |
| 19 | Repeat purchase & time between orders | `LAG` внутри пользователя |
| 20 | RFM segmentation | `NTILE` quintiles, segment-score rules |
| 21 | Subscription churn (logo & MRR) | monthly churn, `FILTER` aggregates |
| 22 | Refunds & net revenue | left join, gross-vs-net |
| 23 | Pareto / revenue concentration | `NTILE(10)`, cumulative-share curve |
| 24 | Daily revenue anomaly detection | robust MAD z-score, rolling baseline |
| 25 | Purchase → subscription conversion | join к subscriptions, time-to-convert |

## Quick start

```bash
uv run python data/generate_data.py   # data/analytics.duckdb
uv run python run.py            # список кейсов
uv run python run.py 1          # запустить кейс 1
uv run python run.py 9 --limit 20
uv run --extra dev pytest -q    # 41 regression-тест
uv run python scripts/report.py # reports/index.html
```

Runner печатает вопрос кейса, выполняет SQL против `data/analytics.duckdb`, рендерит результат таблицей. Отчёт с графиками публикуется на GitHub Pages автоматически при push.

## Insight

Каждый кейс покрывает конкретный оконно-функциональный паттерн. Ключевые находки честные, а не подогнанные: repeat rate всего 3.5% (896 покупателей, 31 повторный) — это one-and-done purchase engine; RFM вырождается в recency-историю; топ-дециль даёт лишь 22% выручки (нет «китов»); лого-churn растёт до ~15%/мес при растущем MRR. Расхождение вопрос/подход в одном файле + regression-инварианты делают кейсы самопроверяемыми.

## Impact

- **25 самодостаточных SQL-кейсов** — от funnel до RFM, каждый со своим оконным паттерном.
- **Sessionization с валидацией** — 30-min gap воспроизводит 80k pre-assigned sessions с точностью 99.6%.
- **Аддитивные данные без поломки золотых ответов** — seed=43 на отдельном RNG-потоке.
- **DuckDB без инфраструктуры** — одна команда строит данные и базу.
- **Regression-тесты на кейс** — 41 тест: инварианты + golden-answers держат `cases.md` и код в синхроне.
- **Живой отчёт** — GitHub Pages обновляется на каждый push.

## Documentation

- [Live report → nikitaboyarkin.github.io/sql-analytics-case-study](https://nikitaboyarkin.github.io/sql-analytics-case-study/)
- [GitHub → sql-analytics-case-study](https://github.com/NikitaBoyarkin/sql-analytics-case-study)