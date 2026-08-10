---
title: Cohort Analysis Dashboard
description: Cohort retention and LTV analysis on synthetic data — retention curves, churn patterns, and revenue/LTV by acquisition cohort. Python pipeline (pandas + matplotlib/seaborn) plus a Tableau-ready export with CSV and Hyper extract.
hero: images/bi.png
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
---

# Cohort Analysis Dashboard

## Business Context

Когортный анализ удержания и LTV на синтетических данных: удержание пользователей, кривые оттока и выручка/LTV по когортам прихода. Пайплайн на Python (pandas + matplotlib/seaborn) плюс выгрузка, готовая к загрузке в Tableau. Данные синтетические, детерминированные (seed=42), воспроизводятся из кода.

## Hypothesis

Если разбить пользователей на когорты по месяцу первой активации и построить retention-матрицу + кривые удержания + ARPU/LTV, станет видно скорость оттока по когортам и где монетизация падает быстрее удержания.

## Data & Method

**Модель данных** — одна строка = «пользователь × месяц наблюдения»:

| Поле | Тип | Описание |
|---|---|---|
| `user_id` | int | идентификатор пользователя |
| `cohort_month` | date | месяц прихода (выводится из `join_date`, не отдельное поле) |
| `join_date` | date | дата регистрации (первое число месяца) |
| `period` | int | месяцев с прихода (0 = месяц регистрации) |
| `is_active` | int 0/1 | активен ли в этом месяце |
| `revenue` | int | выручка за месяц (0, если не активен) |

`cohort_month` выводится из `join_date`, как в реальном продакшене. Младшие когорты наблюдались меньше месяцев — матрица удержания треугольная.

**Методология:**

- **Period 0 = 100% удержания** по определению (все активны в месяц прихода). Кривая убывает с периода 1: `retention(p) = 0.85 · 0.75^(p-1)`.
- **Выручка:** активный месяц → `Poisson(λ=10)`; неактивный → 0.
- **Размеры когорт** — число уникальных `user_id` в `period == 0`.
- **ARPU** — средняя выручка на пользователя когорты; **LTV** — кумулятивный ARPU по периодам.

**Функции:** `cohort_sizes()` (приток по месяцам), `retention_matrix()` (матрица + кривые), `revenue_by_cohort()` (ARPU/LTV).

**Tableau-выгрузка** (`tableau_export.py`) создаёт в `tableau/`:
- `cohort_export.csv` — плоский shape для Tableau (доб. `cohort_label` и `period_date` — календарный месяц наблюдения);
- `cohort_extract.hyper` — Tableau Hyper-экстракт через официальный Hyper API.

**Heatmap в Tableau:** Columns = `period`, Rows = `cohort_label`, Marks = Square, Color = AVG(`is_active`), Text = `% of Total` по строке.

## Insight

Когортный вид важнее среднего retention: видна не только скорость оттока, но и монетизация в сравнении с удержанием. LTV младших когорт занижен из-за короткой истории — сравнивать LTV корректно только при равном «возрасте» когорты. Ключевое улучшение: `cohort_month` выводится из `join_date` (а не отдельным случайным полем), period 0 = 100% по конвенции, NaN замаскированы в heatmap вместо рендера `nan%`.

## Impact

- **Когортная матрица удержания** с треугольным убыванием — видно, на каком месяце когорта теряет активность.
- **ARPU / LTV по когортам** с корректным caveat по возрасту наблюдения.
- **Tableau-ready экспорт** — CSV + `.hyper`-экстракт, инструкция по сборке view.
- **Воспроизводимый пайплайн** — `uv` + `pyproject.toml` + `.python-version`, seed=42.

## Documentation

- [GitHub → tableau_cohort_analysis](https://github.com/NikitaBoyarkin/tableau_cohort_analysis)