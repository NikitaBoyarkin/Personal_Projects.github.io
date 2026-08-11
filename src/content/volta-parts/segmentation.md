---
title: "Volta — User Segmentation"
description: "Volta user segmentation — StandardScaler + KMeans, data-driven K. Four segments (Power/Growth/Casual/Dormant); Lorenz concentration and +€310K/yr migration scenarios."
part: segmentation
order: 4
impact:
  - "4 segments: Power 12% / Growth 24% / Casual 32% / Dormant 32%"
  - "Lorenz: 12% users → 41% revenue; 68% → 92%"
  - "+€310K/yr via segment migration scenarios"
tools:
  - Python
  - pandas / NumPy
  - scikit-learn
  - Matplotlib / Seaborn
github: https://github.com/NikitaBoyarkin/volta-banking
---

# Volta — User Segmentation

## Business Context

Четвёртый проект петли **optimize**: кто пользователи и как монетизировать каждый сегмент? Перевод аналитики в деньги.

## Hypothesis

Пользователи разбиваются на небольшое число однородных сегментов с разными monetization-паттернами.

## Data & Method

- **StandardScaler + KMeans**.
- Data-driven K: marginal-gain elbow, силуэтный plateau **K = 2–4**, коллапс при **K = 5**.
- Lorenz-curve анализ концентрации выручки.

## Insight

- **4 сегмента**: Power **12%** / Growth **24%** / Casual **32%** / Dormant **32%**.
- **Lorenz**: 12% пользователей → **41%** выручки; 68% → **92%**.
- Сценарии миграции (Casual → Growth, Growth → Power) дают **+€26K/mo**.

## Impact

- **+€310K/yr** через миграцию между сегментами.
- Per-segment стратегия монетизации вместо усреднённого подхода.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)