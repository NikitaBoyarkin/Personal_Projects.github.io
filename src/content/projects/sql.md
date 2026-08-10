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

Take-home–формат: 10 end-to-end SQL-кейсов на синтетическом продуктовом датасете. Каждый кейс — один самодостаточный `.sql` файл с вопросом и подходом в leading-комментарии. Без сервера, без кредов — одна команда строит данные и базу DuckDB.

## Data & Method

**Модель данных** (синтетическая, seed=42, детерминированная):

| Сущность | Объём | Поля |
|---|---|---|
| **Users** | 20,000 signups (Jan–Jun 2024) | `channel`, `country`, `device`, `ab_variant` |
| **Events** | ~183k funnel-событий | `app_open → view_item → add_to_cart → checkout → purchase`, ~80k sessions |
| **Orders** | ~800 покупок | amount, product category |
| **Subscriptions** | ~240 конверсий | monthly / annual plans |

Схема: `data/schema.sql`. Генератор: `data/generate_data.py`. Engagement геометрически убывает от signup; retention взвешен каналом привлечения — когорты и каналы дают видимые нетривиальные различия.

**10 кейсов:**

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
| 09 | A/B conversion by variant | left join, `LAG` для lift |
| 10 | Revenue attribution | first-touch vs lifetime, correlated subquery |

## Quick start

```bash
uv run --with duckdb --with pandas --with numpy python data/generate_data.py   # data/analytics.duckdb
uv run --with duckdb --with pandas python run.py            # список кейсов
uv run --with duckdb --with pandas python run.py 1          # запустить кейс 1
uv run --with duckdb --with pandas python run.py 4 --limit 20
uv run --with duckdb --with pandas --with numpy --with pytest pytest -q   # regression-тесты
```

Runner печатает вопрос кейса, выполняет SQL против `data/analytics.duckdb`, рендерит результат таблицей.

## Insight

Каждый кейс покрывает конкретный оконно-функциональный паттерн, который встречается в реальных продуктовых задачах: cumulative counts, gaps-and-islands, partitioned Top-N, range-join для stickiness. Разделение вопроса и SQL в одном файле + regression-инварианты делают кейсы самопроверяемыми — запуск `pytest` подтверждает, что SQL продолжает давать ожидаемые метрики после любого изменения генератора.

## Impact

- **10 самодостаточных SQL-кейсов** — от funnel до revenue attribution, каждый со своим оконным паттерном.
- **DuckDB без инфраструктуры** — одна команда строит данные и базу; нет сервера, нет кредов.
- **Regression-тесты на кейс** — детерминированные инварианты защищают от регрессий при изменении генератора.
- **Воспроизводимые данные** (seed=42) — повторный запуск даёт идентичный результат.

## Documentation

- [GitHub → sql-analytics-case-study](https://github.com/NikitaBoyarkin/sql-analytics-case-study)