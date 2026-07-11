---
title: Cohort Retention Analysis in Python
date: 2025-04-10
category: guide
tags:
  - retention
  - cohort-analysis
  - python
  - pandas
excerpt: A practical guide to building a cohort retention matrix in Pandas and interpreting what it actually tells you about the product.
draft: false
---

# Cohort Retention Analysis in Python

Cohort analysis is one of the most useful tools for understanding whether your product keeps users over time. It groups users by when they started and tracks how many of them come back each subsequent period.

## Why Cohorts Beat Aggregate Retention

Aggregate retention can hide problems. If you see 30% monthly retention, it could mean:

- All cohorts retain at 30%, or
- New cohorts retain at 50% while old cohorts dropped to 10%

The second case is much more actionable, but aggregate numbers will not show it.

## Building the Matrix in Pandas

```python
import pandas as pd

# events has user_id, event_date, event_type
df = pd.read_csv('events.csv', parse_dates=['event_date'])

# first activity per user
cohort = df.groupby('user_id')['event_date'].min().reset_index()
cohort.columns = ['user_id', 'cohort_month']
cohort['cohort_month'] = cohort['cohort_month'].dt.to_period('M')

# merge back
events = df.merge(cohort, on='user_id')
events['activity_month'] = events['event_date'].dt.to_period('M')
events['period'] = (events['activity_month'] - events['cohort_month']).apply(attrgetter('n'))

# matrix
cohort_counts = events.groupby(['cohort_month', 'period'])['user_id'].nunique().reset_index()
cohort_size = cohort.groupby('cohort_month')['user_id'].nunique()
retention = cohort_counts.pivot(index='cohort_month', columns='period', values='user_id')
retention = retention.divide(cohort_size, axis=0)
```

## Reading the Result

- **Row** = users who started in a given month.
- **Column 0** = 100% by definition.
- **Column 1** = share of the cohort that returned one month later.
- Diagonal drops usually point to seasonality or product changes.

## Common Mistakes

1. **Wrong cohort definition.** First visit is safer than first purchase unless you analyze monetization specifically.
2. **Ignoring the acquisition channel.** Cohorts from paid ads often behave differently from organic ones.
3. **Looking at retention without a target.** A number alone does not tell you if it is good.

## Next Steps

Once the matrix works, add slices: channel, device, country, onboarding version. That turns a dashboard into a diagnosis tool.
