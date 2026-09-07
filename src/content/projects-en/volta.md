---
title: Volta Neobank — Product Analytics
description: "End-to-end neobank analytics narrative — 17 projects across 12 analytical domains + Market & Jobs: funnel, A/B, retention, segmentation, churn, RFM, CLV, attribution, anomaly, spend, NPS, JTBD, unit economics, upsell, referral. Synthetic fintech data, reproducible seeded pipelines, ship-gated statistical methodology."
track: experiments
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

## The Case

«Volta» is a fictional neobank that was losing users during onboarding. Marketing saw traffic, product saw activation, support saw tickets. Every team had its own number — and none of them explained where the money was leaking. We started with one question: **which onboarding step is critical?**

We answered it with four projects wired into a single **discover → validate → measure → optimize** loop. Each project is a piece of evidence that narrows the case. All data is synthetic, generated deterministically (seed), and reproduced from code: any conclusion can be re-checked by re-running, not taken on faith.

## Evidence #1 — Funnel: where the leak is

The first piece of evidence is the onboarding funnel down to the first productive action. The main leak was in **KYC** — the verification step: the largest relative drop-off (56.6% step conversion). Registration loses more in absolute terms (2,682 users, 73.2% step conv), but KYC is more expensive: the user has already made it halfway and still leaves.

Hypothesis: the form is too long and there is no intermediate confirmation.

→ [Funnel Analysis — case file](/projects/volta/funnel/)

## Evidence #2 — A/B: does the fix work

A snapshot is not proof: we validated the funnel finding as an experiment, not a slice. Hypothesis: split KYC into steps with a progress bar.

Test design:

- **CUPED** with "sessions before the test" as covariate — removed part of the noise, the sample did not grow
- **AA-test** before launch: Type I error = 0.050 — the method does not imagine significance
- **Bonferroni** across multiple metrics — multiplicity control
- **Ship-gate**: ship only if significance ∧ lift ≥ MDE ∧ no SRM

Verdict: control 55.8% → treatment 62.1%, **+6.24pp**, p < 0.0001, 95% CI [+4.26%, +8.16%], above the +5pp MDE → **ship**. At a realistic audience this is ≈ **€716K/yr** at 48× ROI.

→ [A/B Testing — case file](/projects/volta/ab/)

## Evidence #3 — Retention: does the effect hold

Shipping is not the end: we checked the effect on retention with cohort triangles (signup month × age) instead of "the average across everyone". Along the diagonal: cohorts with the new onboarding hold **M3 retention at +9.2pp** over older cohorts → **+€227K/yr incremental LTV**. The new onboarding improves both the first week (faster time-to-value) and month 3 (less churn after the "honeymoon"). Without triangles, this conclusion would hide behind the average.

→ [Retention & Cohort — case file](/projects/volta/retention/)

## Evidence #4 — Segmentation: who pays

The effect held — the remaining question was who these users are and how to monetize them. StandardScaler + KMeans, data-driven K: **4 segments** — Power 12% / Growth 24% / Casual 32% / Dormant 32%. Lorenz: 12% of users drive 41% of revenue; 68% → 92%. Migration scenarios: up to **+€310K/yr**.

→ [User Segmentation — case file](/projects/volta/segmentation/)

## The Verdict

A loop of four projects beats isolated analyses: the KYC fix found in the funnel was validated in the A/B test, confirmed in retention, and translated into money through segmentation. The core is the **three-condition ship-gate** (significance ∧ lift ≥ MDE ∧ no SRM): it protects against shipping statistically-significant but business-insignificant changes. Order matters more than numbers: calibrate the instrument first (AA-test, CUPED), then conclude.

## Case File: repository expansion

The repo has grown from 4 core projects to **17** (12 analytical domains + Market & Jobs). Additional projects:

| # | Project | Key finding |
|---|---|---|
| 5 | **Churn Prediction** | RF +0.03 ROC-AUC over LR; top driver = inactivity |
| 6 | **RFM Analysis** | 6 lifecycle segments |
| 7 | **CLV Modeling** | 3 methods: historical / retention-curve / Gamma-Gamma |
| 8 | **Marketing Attribution** | First/last/linear/Shapley — referral leads |
| 9 | **Anomaly Detection** | Z-score/IQR/Isolation Forest, scored vs ground truth |
| 10 | **Spend Analysis** | Category/channel breakdown, decline rate, monthly trend |
| 11 | **Support & Churn** | Churn by tickets, unresolved, CSAT band |
| 12 | **NPS Trends** | Monthly NPS, drivers, promoter mix |
| 13 | **JTBD × Cohorts** | Dormant = UX friction (Digital Newcomers 45+), not "no job" |
| 14 | **Unit Economics** | Travelers lose €/tx; break-even needs FX cost 1.0%→0.55% |
| 15 | **Premium Upsell** | Anchor 17% vs Digital Newcomers 45+ 2% — value prop doesn't land |
| 16 | **45+ KYC Deep-Dive** | 45+ lift +0.6pp (ns) vs 35-44 +10pp — friction is trust, not UX |
| 17 | **Referral Segments** | Anchor 29.6% vs Digital Newcomers 4.8% — value prop doesn't transfer |

## Data & Method

**Data:** synthetic, seeded generators (`generate_*.py`) → reproducible CSVs. The funnel dataset is committed; the rest are generated on demand.

**Per-project methodology:**

1. **Funnel** — step conversion, absolute/relative drop-off, Chi-square test across channels. Registration loses the most users in absolute terms (2,682, 73.2% step conv); KYC Complete has the largest relative drop-off (56.6% step conv). Referral converts 11.7pp better than paid social; iOS beats Android at every step (13.6% vs 11.7% end-to-end).
2. **A/B (KYC progress bar)** — sample size calculation, SRM check (p=1.00), bootstrap CI, multiple-comparison correction (Bonferroni/Holm/BH), AA-test under H₀ (type-I = 0.050), CUPED (control-only θ), sensitivity at MDE. Control 55.8% → treatment 62.1%, **+6.24pp**, 95% CI [+4.26%, +8.16%], exceeds the +5pp MDE. Ship-gate: p<0.05 ∧ lift≥MDE ∧ no SRM → ship. 9/11 naively-significant segments, 4/11 after Bonferroni.
3. **Retention** — cohort curves, pre/post Welch t-test + Cohen's d, plan-specific LTV (ARPU × retention decomposition). M1 retention +10pp step-change, M3 +9.2pp.
4. **Segmentation** — StandardScaler + KMeans, data-driven K (marginal-gain elbow, silhouette plateau K=2–4, collapse at K=5). Segments: Power 12% / Growth 24% / Casual 32% / Dormant 32%. Lorenz: 12% of users → 41% of revenue; 68% → 92%. Migration scenarios: +€26K/mo (€310K/yr).

**Code structure:** shared `utils/common.py` (`setup()`, `print_section()`, `CONSTANTS`, `data_path()`), `functions + main()` — importing a module does not run the analysis. Excel reports via `openpyxl`.

## Impact

- **KYC conversion +6.24pp** (p<0.0001, exceeds MDE) → business impact **€716K/yr** (48× ROI on €15K dev cost).
- **M3 retention +9.2pp** → **+€227K/yr** incremental LTV from the KYC fix.
- **4 segments** with per-segment strategy and up to **+€310K/yr** monetization via migration.
- **Reproducible methodology** — CUPED, AA-test, Bonferroni, sensitivity at MDE; 4 recommended A/B tests to validate the strategy.
- **17 projects** — 12 analytical domains + Market & Jobs (JTBD): from funnel to referral segments.

## Documentation

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)
