---
title: "Volta — A/B Testing (KYC progress bar)"
description: "The neobank's KYC progress-bar A/B test: +5.72pp (p<0.0001), above the +5pp MDE, with CUPED, an A/A check and Bonferroni. Worth €656K/year at 44× ROI."
part: ab
order: 2
impact:
  - "+5.72pp KYC (Z=5.82, p<0.0001), 95% CI [+3.78%, +7.66%], exceeds +5pp MDE"
  - "CUPED + AA-test (type-I=0.050) + Bonferroni (4/11 survive)"
  - "€656K/yr business impact (44× ROI)"
tools:
  - Python
  - pandas / NumPy
  - SciPy / Statsmodels
  - Matplotlib / Seaborn
github: https://github.com/NikitaBoyarkin/volta-banking
---

# Volta — A/B Testing (KYC progress bar)

## Context

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

## Findings

- Control **55.8%** → treatment **61.5%**, **+5.72pp**, 95% CI **[+3.78%, +7.66%]**.
- Exceeds MDE (+5pp), p<0.0001 (Z = 5.82).
- **6/11** naively-significant segments → **4/11** after Bonferroni (correction removes false positives).

## Impact

- **KYC conversion +5.72pp** → business impact **€656K/yr** (44× ROI on €15K dev cost).
- The methodology (CUPED + AA-test + Bonferroni + ship-gate) is reusable for future experiments.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)