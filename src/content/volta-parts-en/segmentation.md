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

The fourth project in the **optimize** loop: who are the users and how do we monetize each segment? Turning analytics into money.

## Hypothesis

Users split into a small number of homogeneous segments with distinct monetization patterns.

## Data & Method

- **StandardScaler + KMeans**.
- Data-driven K: marginal-gain elbow, silhouette plateau **K = 2–4**, collapse at **K = 5**.
- Lorenz-curve analysis of revenue concentration.

## Insight

- **4 segments**: Power **12%** / Growth **24%** / Casual **32%** / Dormant **32%**.
- **Lorenz**: 12% of users → **41%** of revenue; 68% → **92%**.
- Migration scenarios (Casual → Growth, Growth → Power) yield **+€26K/mo**.

## Impact

- **+€310K/yr** through migration between segments.
- A per-segment monetization strategy instead of an averaged approach.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)