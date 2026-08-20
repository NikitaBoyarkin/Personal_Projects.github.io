---
title: Volta Neobank — Product Analytics
description: End-to-end neobank analytics narrative — funnel, A/B test, retention, segmentation. Four sequential projects on synthetic fintech data with reproducible seeded pipelines and ship-gated statistical methodology.
hero: images/volta.svg
impact:
  - +6.24pp KYC conversion (Z=6.35, p<0.0001), €716K/yr (48× ROI)
  - +9.2pp M3 retention, +€227K/yr incremental LTV
  - 4 data-driven user segments with per-segment monetization strategy
  - CUPED variance reduction + AA-test (type-I = 0.050) + Bonferroni correction
tools:
  - Python
  - pandas / NumPy
  - SciPy / Statsmodels
  - scikit-learn
  - Matplotlib / Seaborn
  - uv + ruff
github: https://github.com/NikitaBoyarkin/volta-banking
date: 2026-08-11
faq:
  - question: "Where is the onboarding drop-off?"
    answer: "KYC is the critical bottleneck: the largest relative drop-off (56.6% step conversion)."
  - question: "Does the progress bar fix the KYC problem?"
    answer: "Yes: +6.24pp lift (p<0.0001), 95% CI [+4.26%, +8.16%], above the +5pp MDE → ship."
  - question: "Did the effect hold?"
    answer: "Yes: +9.2pp M3 retention, +€227K/yr incremental LTV."
  - question: "Who are the users, how to monetize?"
    answer: "4 segments (Power 12% / Growth 24% / Casual 32% / Dormant 32%) with per-segment strategy; migration worth up to +€310K/yr."
related:
  - /posts/bayesian-ab-testing/
children:
  - funnel
  - ab
  - retention
  - segmentation
caseStudy:
  problem: "The neobank was losing users during onboarding, but it was unclear which step was critical and whether a fix would actually hold. Isolated analyses produced local numbers with no product-level connection."
  approach: "Four projects wired into a single discover → validate → measure → optimize loop: funnel found the KYC bottleneck, an A/B test with CUPED + AA-test + Bonferroni validated a progress-bar fix under a three-condition ship-gate (significance ∧ lift≥MDE ∧ no SRM), retention confirmed the effect held, and segmentation translated it into revenue."
  result: "The KYC fix delivered +6.24pp conversion and €716K/yr (48× ROI), the effect held in retention (+9.2pp M3, +€227K/yr LTV), and segmentation showed 12% of users drive 41% of revenue — migration is worth up to +€310K/yr. The reproducible methodology protects against shipping statistically-significant but business-insignificant changes."
  metrics:
    - label: "KYC conversion lift"
      value: "+6.24pp"
    - label: "Annual revenue"
      value: "€716K/yr"
    - label: "ROI"
      value: "48×"
    - label: "M3 retention"
      value: "+9.2pp"
---

# Volta Neobank — Product Analytics

## Business Context

«Volta» is a fictional neobank. Four projects drive a single product loop **discover → validate → measure → optimize**: where the leak is, whether the fix works, whether the effect holds, and how to monetize it. All data is synthetic, generated deterministically (seed), and reproduced from code.

## The Narrative

| # | Project | Question | Key finding |
|---|---|---|---|
| 1 | **Funnel Analysis** | Where does onboarding leak? | KYC is the critical bottleneck |
| 2 | **A/B Testing** | Does a progress bar fix KYC? | +6.24pp lift, p<0.0001 → ship |
| 3 | **Retention & Cohort** | Did the effect hold? | +9.2pp M3 retention, +€227K/yr LTV |
| 4 | **User Segmentation** | Who are the users, how to monetize? | 4 segments, per-segment strategy |

## Data & Method

**Data:** synthetic, seeded generators (`generate_*.py`) → reproducible CSVs. The funnel dataset is committed; the rest are generated on demand.

**Per-project methodology:**

1. **Funnel** — step conversion, absolute/relative drop-off, Chi-square test across channels. Registration loses the most users in absolute terms (2,682, 73.2% step conv); KYC Complete has the largest relative drop-off (56.6% step conv). Referral converts 11.7pp better than paid social; iOS beats Android at every step (13.6% vs 11.7% end-to-end).
2. **A/B (KYC progress bar)** — sample size calculation, SRM check (p=1.00), bootstrap CI, multiple-comparison correction (Bonferroni/Holm/BH), AA-test under H₀ (type-I = 0.050), CUPED (control-only θ), sensitivity at MDE. Control 55.8% → treatment 62.1%, **+6.24pp**, 95% CI [+4.26%, +8.16%], exceeds the +5pp MDE. Ship-gate: p<0.05 ∧ lift≥MDE ∧ no SRM → ship. 9/11 naively-significant segments, 4/11 after Bonferroni.
3. **Retention** — cohort curves, pre/post Welch t-test + Cohen's d, plan-specific LTV (ARPU × retention decomposition). M1 retention +10pp step-change, M3 +9.2pp.
4. **Segmentation** — StandardScaler + KMeans, data-driven K (marginal-gain elbow, silhouette plateau K=2–4, collapse at K=5). Segments: Power 12% / Growth 24% / Casual 32% / Dormant 32%. Lorenz: 12% of users → 41% of revenue; 68% → 92%. Migration scenarios: +€26K/mo (€310K/yr).

**Code structure:** shared `utils/common.py` (`setup()`, `print_section()`, `CONSTANTS`, `data_path()`), `functions + main()` — importing a module does not run the analysis. Excel reports via `openpyxl`.

## Insight

The four-project loop is more valuable than isolated analyses: the KYC fix found in the funnel is validated in the A/B test, confirmed in retention, and monetized through segmentation. The key is a ship-gate with three conditions (significance ∧ lift≥MDE ∧ no SRM) that protects against rolling out statistically-significant but business-insignificant changes; CUPED and the AA-test cut variance and verify the error rate before launch.

## Impact

- **KYC conversion +6.24pp** (p<0.0001, exceeds MDE) → business impact **€716K/yr** (48× ROI on €15K dev cost).
- **M3 retention +9.2pp** → **+€227K/yr** incremental LTV from the KYC fix.
- **4 segments** with per-segment strategy and up to **+€310K/yr** monetization via migration.
- **Reproducible methodology** — CUPED, AA-test, Bonferroni, sensitivity at MDE; 4 recommended A/B tests to validate the strategy.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)