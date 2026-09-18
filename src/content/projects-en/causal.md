---
title: Causal / Uplift — CUPED and Individual Treatment Effects
description: Causal inference for product experiments — CUPED variance reduction and T-/S-learner uplift on a synthetic randomized A/B test with a known heterogeneous effect, evaluated against ground truth with AUUC, Qini and per-segment recovery.
track: experiments
hero: images/causal.svg
impact:
  - CUPED keeps the ATE (0.270 → 0.276) and cuts the standard error ~26%
  - Same power with ~5.6k users/arm instead of 10k (95% CI narrows 1.35x)
  - Uplift models recover that new users respond ~10x more than returning users
  - Implemented from scratch on LightGBM — no causalml/econml dependency
tools:
  - Python
  - LightGBM
  - scikit-learn
  - pandas / NumPy
  - matplotlib
  - pytest
  - uv
github: https://github.com/NikitaBoyarkin/causal-uplift
updated: 2026-09-18
date: 2026-09-18
related:
  - /projects/ab/
  - /posts/churn-uplift-discount/
caseStudy:
  problem: "A standard two-sample t-test answers only 'does the treatment work on average' and ignores the pre-period. As a result, experiments need more traffic than necessary, and retention offers go to everyone while only part of the users respond. The project needs methods that reduce variance and estimate the effect at the individual-user level."
  approach: "CUPED: Y_adj = Y − θ·(X − mean(X)), with θ = Cov(Y,X)/Var(X) — the same expected ATE with variance ~(1 − ρ²). Two LightGBM uplift learners: a T-learner (one model per arm) and an S-learner (treatment as a feature), uplift = P(t=1) − P(t=0). Evaluation: AUUC, Qini, uplift@20%, rank correlation with the latent τ, and per-segment recovery; all implemented from scratch on LightGBM, without causalml/econml."
  result: "CUPED leaves the point estimate unchanged (0.270 -> 0.276, within noise) but shrinks the standard error by ~26% and narrows the 95% CI by 1.35x — an experiment that needed 10k users per arm now needs ~5.6k. Both learners beat random on every metric; the model recovers that new users respond ~10x more than returning users, the signal a discount campaign would act on."
  metrics:
    - label: "SE reduction"
      value: "−26%"
    - label: "95% CI narrowing"
      value: "1.35x"
    - label: "Users per arm"
      value: "10k → 5.6k"
    - label: "corr(τ), S-learner"
      value: "0.66"
---

# Causal / Uplift — CUPED and Individual Treatment Effects

## Business Context

Causal inference for product experiments — two methods that go beyond "a t-test on the outcome":

1. **CUPED** — variance reduction using a pre-period covariate. Same ATE, smaller CI → experiments need fewer users to reach significance.
2. **Uplift modeling** — estimate the *individual* treatment effect (ITE), so retention and discount actions target the users who actually respond, not everyone.

Both run on a synthetic randomized A/B experiment with a known, heterogeneous treatment effect, so the estimates can be checked against ground truth.

## Data & Method

Synthetic, deterministic data (seed = 42), 20,000 users in a randomized experiment:

- `segment` — `new` (30%) / `returning` (70%) → heterogeneous treatment effect;
- `x_pre` — a pre-period covariate correlated with the outcome (ρ ≈ 0.67);
- `treatment` — 50/50, independent of everything (clean randomization);
- `tau_true` — the ground-truth individual treatment effect (eval only);
- `y_cont` — continuous outcome; `y_bin` — binary conversion.

**CUPED** — same ATE estimate, less variance:

| Method | ATE | SE | 95% CI |
|---|---|---|---|
| Naive | 0.270 | 0.019 | [0.232, 0.308] |
| CUPED | 0.276 | 0.014 | [0.247, 0.304] |

The point estimate is unchanged (0.270 → 0.276, within noise). The standard error shrinks by ~26% (×0.74) and the CI narrows 1.35x. Variance reduction is ~45% actual vs 55% theoretical (the gap is the covariate being a pre-period proxy, not the outcome itself).

**Uplift** — individual effects, T- and S-learners:

| Model | AUUC | QINI | uplift@20% | corr(τ) |
|---|---|---|---|---|
| T-learner | 0.0043 | 0.0014 | 0.072 | 0.50 |
| S-learner | 0.0057 | 0.0029 | 0.041 | 0.66 |
| Random | 0.0014 | −0.0014 | −0.015 | 0.007 |

Segment-level recovery (predicted vs empirical ground truth):

| Segment | Truth (binary uplift) | T-learner | S-learner |
|---|---|---|---|
| new | 0.110 | 0.126 | 0.120 |
| returning | 0.010 | 0.018 | 0.019 |

The model recovers that "new" users respond ~10x more than "returning" users — the targeting signal a discount campaign would act on.

A note on honesty: the latent ground-truth τ is 0.60 (new) / 0.08 (returning), but the *conversion* uplift is ~0.11 / 0.01 because the sigmoid at a high baseline conversion (~71%) damps large latent effects. Comparing predicted binary uplift to latent τ would be a scale mismatch; we report rank correlation (scale-free) and per-segment empirical recovery (same scale).

## Run

```bash
uv run --with pandas --with numpy python data/generate_data.py
uv run --with pandas --with numpy --with scikit-learn --with lightgbm --with matplotlib python run.py
uv run --with pandas --with numpy --with scikit-learn --with lightgbm --with matplotlib --with pytest pytest -q
```

Outputs: `reports/metrics.json` + `reports/uplift.png` (QINI curves + segment uplift vs ground truth).

## Insight

CUPED buys power for free if you have a pre-period covariate — no new experiment design, just a better estimator on data you already collected. Uplift modeling answers a different question than A/B testing: not "does the treatment work on average" but "who does it work on". The two are complementary, not substitutes. Synthetic data with a true heterogeneous effect is the only reason recovery can be checked at all: on real data the ITE is never observed — the fundamental problem of causal inference.

## Impact

- **CUPED** — same ATE estimate, standard error −26%, 95% CI 1.35x narrower.
- **Traffic savings** — 10k → ~5.6k users per arm at the same power.
- **Uplift** — T- and S-learners beat random on AUUC, Qini and uplift@20%.
- **Targeting** — the recovered "new ~10x returning" effect turns discounts from "everyone" into addressed actions.

## Documentation

- [GitHub → causal-uplift](https://github.com/NikitaBoyarkin/causal-uplift)
