---
title: "Volta — A/B Testing (KYC progress bar)"
description: "Volta A/B test — KYC progress bar. +6.24pp lift (Z=6.35, p<0.0001) exceeding the +5pp MDE, with CUPED variance reduction, AA-test calibration (type-I=0.050) and Bonferroni correction. €716K/yr impact."
part: ab
order: 2
impact:
  - "+6.24pp KYC (Z=6.35, p<0.0001), 95% CI [+4.26%, +8.16%], exceeds +5pp MDE"
  - "CUPED + AA-test (type-I=0.050) + Bonferroni (4/11 survive)"
  - "€716K/yr business impact (48× ROI)"
tools:
  - Python
  - pandas / NumPy
  - SciPy / Statsmodels
  - Matplotlib / Seaborn
github: https://github.com/NikitaBoyarkin/volta-banking
---

# Volta — A/B Testing (KYC progress bar)

## Business Context

The second project in the **validate** loop: does a progress bar in KYC fix the problem found in the funnel? A ship-gated methodology protects against rolling out statistically-significant but business-insignificant changes.

## Hypothesis

A KYC progress bar raises KYC completion conversion by at least +5pp (MDE) with no SRM.

## Data & Method

- Sample size calculation for MDE = +5pp.
- SRM check (sample ratio mismatch): **p = 1.00** → balanced samples.
- Bootstrap CI + multiple-comparison correction (Bonferroni / Holm / BH).
- **AA-test** under H₀: type-I error = **0.050** (methodology calibrated).
- **CUPED** (control-only θ): variance reduction, sensitivity at MDE.
- Ship-gate: **p<0.05 ∧ lift ≥ MDE ∧ no SRM → ship**.

## Insight

- Control **55.8%** → treatment **62.1%**, **+6.24pp**, 95% CI **[+4.26%, +8.16%]**.
- Exceeds MDE (+5pp), p<0.0001 (Z = 6.35).
- **9/11** naively-significant segments → **4/11** after Bonferroni (correction removes false positives).

## Impact

- **KYC conversion +6.24pp** → business impact **€716K/yr** (48× ROI on €15K dev cost).
- The methodology (CUPED + AA-test + Bonferroni + ship-gate) is reusable for future experiments.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)