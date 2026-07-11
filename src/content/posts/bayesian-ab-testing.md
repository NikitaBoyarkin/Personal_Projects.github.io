---
title: Why We Switched to Bayesian A/B Testing
date: 2025-03-15
category: decision-log
tags:
  - ab-testing
  - bayesian
  - statistics
excerpt: Frequentist p-values were creating a culture of peeking. Here's how Bayesian inference changed our experiment workflow.
---

In 2024, our team ran 127 experiments. 34 of them showed early significance, only to reverse once we reached the planned sample size. The cost: delayed launches, frustrated stakeholders, and a creeping distrust in data.

## The Problem with Peeking

The classical frequentist approach assumes a fixed sample size decided before the experiment starts. Every time you look at the results before reaching that sample size, you're inflating your Type I error rate.

We tried sequential testing with O'Brien-Fleming boundaries. It helped, but the math was opaque to stakeholders.

## The Bayesian Alternative

Instead of asking "is there an effect?", Bayesian inference asks "how likely is it that the effect is positive?" This subtle reframing changes everything about how you communicate results to product managers.

The key metric becomes the **Probability of Direction (PoD)**: the probability that the treatment is better than control.

```python
import pymc as pm

with pm.Model() as model:
    mu_control = pm.Normal("mu_control", mu=0.10, sigma=0.02)
    mu_treatment = pm.Normal("mu_treatment", mu=0.10, sigma=0.02)
    # ...
```

## Results After 6 Months

- Experiment duration reduced by 15% on average
- Stakeholder confidence in results increased
- Zero cases of "early significance reversal"
