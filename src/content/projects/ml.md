---
title: ML Fundamentals — Preprocessing Pipeline
description: Hands-on implementation of a production-style ML preprocessing pipeline in scikit-learn — missing-data imputation, categorical encoding, deterministic 80/20 split, feature scaling — plus a seeded synthetic-data generator and unified EDA charts.
track: analytics
hero: images/ml.svg
impact:
  - Single ColumnTransformer pipeline fit on the training split only (no test leakage)
  - Deterministic 80/20 split by stable sort — no reliance on a random seed
  - Seeded generator producing scaled datasets per pipeline stage
  - Unified dark-style EDA dashboard + pytest smoke tests
tools:
  - Python
  - scikit-learn
  - pandas / NumPy
  - Matplotlib
  - pytest
  - uv
github: https://github.com/NikitaBoyarkin/ml
date: 2026-08-22
caseStudy:
  problem: "Курсовые ML-реализации часто сломаны на современном scikit-learn: старые API (`cross_validation`, `Imputer`, `OneHotEncoder(categorical_features=)`) удалены в sklearn ≥ 0.22. Нужно переписать preprocessing-часть пайплайна на современный API и показать его как основу для остальных этапов."
  approach: "Весь preprocessing — один `ColumnTransformer` (`SimpleImputer` → `StandardScaler` для числовых, `OneHotEncoder` для категориальных), fit на тренировочном сплите, чтобы тестовая информация не утекла. Разделение — детерминированное 80/20: стабильная сортировка по `(Country, Age)`, каждый 5-й ряд идёт в тест (без зависимости от случайного seed). Дополнительно — seeded-генератор крупных датасетов под каждый этап и EDA-графики в едином стиле."
  result: "Рабочий пайплайн на современном API с детерминированным разделением (`Train: (8, 5), Test: (2, 5)`), генератор синтетических данных (400/300/500/800 строк под preprocessing/регрессию/классификацию) и pytest smoke-тесты, проверяющие разделение и стабильность сплита."
  metrics:
    - label: "Pipeline-этапов"
      value: "4"
    - label: "Сплит"
      value: "80/20"
    - label: "Датасетов"
      value: "6"
    - label: "Smoke-тестов"
      value: "3+"
---

# ML Fundamentals — Preprocessing Pipeline

## Business Context

Хендс-он реализация пайплайна из ML-курса на современном Python/scikit-learn. Фокус — **процесс** (preprocessing) как фундамент всех следующих этапов: импутация пропусков, кодирование категорий, train/test split и feature scaling. Сделано с современным тулингом — uv + ruff.

## Data & Method

**`python/data_preprocessing.py`** — preprocessing на `Data.csv`:

- **Пропуски**: импутация средним через `SimpleImputer`.
- **Категории**: `OneHotEncoder` для фичей, `LabelEncoder` для таргета.
- **Сплит**: детерминированный 80/20 — строки стабильно сортируются по `(Country, Age)`, каждый 5-й ряд — тест (без опоры на случайный seed).
- **Масштабирование**: `StandardScaler` только на числовых колонках.

Всё — один `ColumnTransformer` (`SimpleImputer` → `StandardScaler` для числовых, `OneHotEncoder` для категориальных), **fit на тренировочном сплите только** — тестовая информация не утекает в preprocessing.

**`python/generate_dummy_data.py`** — детерминированный генератор (seeded RNG) крупных датасетов, по одному на этап пайплайна:

| Файл | Паттерн | Объём |
|------|---------|-------|
| `Data_large.csv` | `Data.csv` | 400 строк, расширенный preprocessing |
| `Salary_Data_large.csv` | `Salary_Data.csv` | 300 строк, простая линейная регрессия |
| `Housing_Data.csv` / `.sql` | `50_Startups.csv` | 500 строк, множественная регрессия |
| `Customer_Churn.csv` / `.json` | `Social_Network_Ads.csv` | 800 строк, классификация |

**`python/eda_plots.py`** — EDA-графики для каждого датасета в `output/` (фигура на датасет + общий `dashboard.png`), единый `dark_background` стиль, OO matplotlib (`fig, ax = plt.subplots`), PNG 300 dpi.

**Тесты:** pytest smoke-тесты проверяют загрузку, полноту и стабильность детерминированного сплита (`pd.testing.assert_frame_equal`).

## Run

```bash
pip install -r requirements.txt
cd python && python3 data_preprocessing.py      # preprocessing
python3 generate_dummy_data.py                   # регенерация синтетики
python ../python/eda_plots.py                    # EDA-чарты в output/
pytest                                          # smoke-тесты
```

## Insight

Ключ этого проекта — **пайплайн, а не набор вызовов**: preprocessing собран в один `ColumnTransformer` и fit'ится на тренировочном сплите, поэтому масштабирование и кодирование не подтекают тестовыми данными. Детерминированный сплит (стабильная сортировка + каждый 5-й ряд) воспроизводим без случайного seed — это гигиена, которая в курсовых проектах обычно отсутствует. Тот же подход переносится на продуктовую аналитику: «нет утечки из будущего в моделируемый момент».

## Impact

- **Современный API** — `ColumnTransformer`, `SimpleImputer`, `OneHotEncoder` без устаревших сигнатур.
- **Детерминированный сплит 80/20** — без зависимости от случайного seed, воспроизводим между запусками.
- **Генератор синтетики** — крупные датасеты под каждый этап пайплайна, seeded.
- **EDA-дашборд** — единый стиль, 300 dpi, `dashboard.png` со всеми фигурами.

## Documentation

- [GitHub → ml](https://github.com/NikitaBoyarkin/ml)