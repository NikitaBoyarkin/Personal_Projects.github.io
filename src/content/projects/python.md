---
title: Python Analytics Playground
description: "Модульный Python-тулкит для аналитики — загрузка, чистка, EDA, визуализация — собранный в один пайплайн с покрытием pytest ≥80%. База, которую я копирую в каждый новый анализ."
track: analytics
hero: images/python.svg
impact:
  - Modular load / clean / EDA / viz / pipeline modules with pytest coverage ≥80%
  - Single end-to-end pipeline runnable as `python -m python_analytics`
  - Requirements traced to a PRD (REQ-002 … REQ-006), tests tied to requirements
  - uv + ruff tooling, synthetic data for demo runs
tools:
  - Python
  - pandas / NumPy
  - Matplotlib
  - pytest
  - uv
github: https://github.com/NikitaBoyarkin/python
updated: 2026-09-03
date: 2026-09-03
related:
  - /posts/eda-python-template/
  - /posts/reproducible-data-pipelines/
---

# Python Analytics Playground

## Business Context

В продуктовой аналитике большая часть задач начинается одинаково: загрузить выгрузку, почистить, посмотреть распределения и корреляции, показать графики. Этот проект превращает эту рутину в переиспользуемые модули — чтобы каждый новый анализ стартовал не с нуля, а с проверенной заготовки с тестами.

## Data & Method

**Структура пакета** (`src/python_analytics/`):

- **`load.py`** (REQ-002) — загрузка CSV в DataFrame с базовыми проверками.
- **`clean.py`** (REQ-003) — пропуски, дубликаты, приведение типов.
- **`eda.py`** (REQ-004) — описательные статистики, пропуски, корреляции.
- **`viz.py`** (REQ-005) — гистограммы, тепловые карты корреляций.
- **`pipeline.py`** (REQ-006) — end-to-end пайплайн, запускаемый как `python -m python_analytics`.

Каждый модуль закрывает отдельное требование из PRD (`docs/prd.md`), а тесты в `tests/` проверяют ровно эти требования — покрытие ≥80%.

## Run

```bash
uv sync --all-groups
uv run pytest                          # тесты + покрытие (≥80%)
uv run python -m python_analytics      # end-to-end пайплайн
```

## Insight

Ключевое отличие от разовых аналитических скриптов — **структура и проверяемость**: модули маленькие и решают одну задачу, требования задокументированы в PRD, а тесты держат покрытие ≥80%. Это делает инструмент «продуктовым»: его можно отдавать коллегам, дорабатывать и не бояться сломать.

## Impact

- **Переиспользуемость** — заготовка для каждого нового анализа вместо скрипта с нуля.
- **Покрытие ≥80%** — изменения не ломают существующее поведение.
- **PRD-трейсинг** — каждый модуль связан с требованием, тесты проверяют требования.
- **uv-тулинг** — воспроизводимая среда без дрейфа зависимостей.

## Documentation

- [GitHub → python](https://github.com/NikitaBoyarkin/python)