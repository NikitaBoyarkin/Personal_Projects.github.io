---
title: Volta — Funnel Analysis
description: "Volta funnel analysis — locating onboarding drop-off. KYC is the critical bottleneck (56.6% step conversion); Registration loses the most in absolute terms. Channel and platform breakdown."
part: funnel
order: 1
impact:
  - KYC Complete — largest relative drop-off (56.6% step conv)
  - Registration — largest absolute loss (2,682 users, 73.2% step conv)
  - Referral +11.7pp over paid social; iOS 13.6% vs Android 11.7% end-to-end
tools:
  - Python
  - pandas / NumPy
  - Matplotlib / Seaborn
  - SciPy
github: https://github.com/NikitaBoyarkin/volta-banking
---

# Volta — Funnel Analysis

## Business Context

The first project in the **discover** loop: find where the fictional neobank «Volta» loses users in onboarding. Data is synthetic, seeded generator → reproducible CSV.

## Hypothesis

The onboarding bottleneck is the KYC step: the largest relative drop-off among funnel steps.

## Data & Method

- Step conversion and absolute/relative drop-off at each funnel step (Sign-up → KYC → Funded → Active).
- Chi-square test for acquisition-channel differences.
- Platform (iOS vs Android) and channel (referral vs paid social) comparison at each step.

## Insight

- **KYC Complete** — largest relative drop-off: **56.6% step conversion** (loses the largest share at a single step).
- **Registration** — largest absolute loss: **2,682 users, 73.2% step conv**.
- **Referral** converts **+11.7pp** better than paid social.
- **iOS** beats Android at every step: **13.6% vs 11.7%** end-to-end.

KYC is the critical bottleneck. This finding feeds the next project — an A/B test of a KYC progress bar.

## Impact

- Onboarding bottleneck (KYC) localized — the basis for the A/B experiment.
- A quantitative baseline across channels and platforms for growth prioritization.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)