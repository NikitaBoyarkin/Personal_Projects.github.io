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
related:
  - /projects/sql/
caseStudy:
  problem: "Course-style ML implementations often break on modern scikit-learn: legacy APIs (`cross_validation`, `Imputer`, `OneHotEncoder(categorical_features=)`) were removed in sklearn ≥ 0.22. The preprocessing stage of the pipeline needed to be rewritten on the current API and shown as the foundation for every later stage."
  approach: "All preprocessing lives in a single `ColumnTransformer` (`SimpleImputer` → `StandardScaler` for numerics, `OneHotEncoder` for categoricals) fit on the training split only, so no test information leaks into preprocessing. The split is deterministic 80/20: rows are stable-sorted by `(Country, Age)` and every 5th row becomes the test set (no reliance on a random seed). A seeded generator produces larger datasets per pipeline stage, and EDA plots share one unified style."
  result: "A working pipeline on the current API with a deterministic split (`Train: (8, 5), Test: (2, 5)`), a synthetic-data generator (400/300/500/800 rows for preprocessing/regression/classification) and pytest smoke tests asserting split completeness and stability."
  metrics:
    - label: "Pipeline stages"
      value: "4"
    - label: "Split"
      value: "80/20"
    - label: "Datasets"
      value: "6"
    - label: "Smoke tests"
      value: "3+"
---

# ML Fundamentals — Preprocessing Pipeline

## Business Context

Hands-on implementation of an ML-course pipeline in modern Python/scikit-learn. The focus is **the pipeline** (preprocessing) as the foundation every later stage — regression, classification, clustering — builds on: missing-data imputation, categorical encoding, train/test split and feature scaling. Built with modern tooling — uv + ruff.

## Data & Method

**`python/data_preprocessing.py`** — preprocessing on `Data.csv`:

- **Missing data**: mean imputation via `SimpleImputer`.
- **Categorical encoding**: `OneHotEncoder` for features, `LabelEncoder` for the target.
- **Train/test split**: deterministic 80/20 — rows are stable-sorted by `(Country, Age)` and every 5th row becomes the test set (no reliance on a random seed).
- **Feature scaling**: `StandardScaler` on numeric columns only.

Everything is a single `ColumnTransformer` pipeline (`SimpleImputer` → `StandardScaler` for numerics, `OneHotEncoder` for categoricals) **fit on the training split only**, so no test information leaks into preprocessing.

**`python/generate_dummy_data.py`** — deterministic generator (seeded RNG) for the extra datasets, one per pipeline stage:

| File | Pattern | Size |
|------|---------|------|
| `Data_large.csv` | `Data.csv` | 400 rows, extended preprocessing set |
| `Salary_Data_large.csv` | `Salary_Data.csv` | 300 rows, simple linear regression |
| `Housing_Data.csv` / `.sql` | `50_Startups.csv` | 500 rows, multiple regression |
| `Customer_Churn.csv` / `.json` | `Social_Network_Ads.csv` | 800 rows, classification |

**`python/eda_plots.py`** — EDA charts for every dataset in `output/` (one figure per dataset + a combined `dashboard.png`), all in a unified `dark_background` style, OO matplotlib (`fig, ax = plt.subplots`), 300 dpi PNG.

**Tests:** pytest smoke tests assert loading, split completeness and split stability (`pd.testing.assert_frame_equal`).

## Run

```bash
pip install -r requirements.txt
cd python && python3 data_preprocessing.py      # preprocessing
python3 generate_dummy_data.py                   # regenerate synthetic sets
python ../python/eda_plots.py                    # render EDA charts to output/
pytest                                          # smoke tests
```

## Insight

The point of this project is **the pipeline, not a bag of calls**: preprocessing is composed into one `ColumnTransformer` and fit on the training split, so scaling and encoding don't leak test data. The deterministic split (stable sort + every 5th row) is reproducible without a random seed — hygiene that course projects usually skip. The same principle transfers to product analytics: "no leakage from the future into the moment being modeled."

## Impact

- **Modern API** — `ColumnTransformer`, `SimpleImputer`, `OneHotEncoder` without legacy signatures.
- **Deterministic 80/20 split** — no reliance on a random seed, reproducible across runs.
- **Synthetic-data generator** — larger datasets per pipeline stage, seeded.
- **EDA dashboard** — unified style, 300 dpi, combined `dashboard.png`.

## Documentation

- [GitHub → ml](https://github.com/NikitaBoyarkin/ml)