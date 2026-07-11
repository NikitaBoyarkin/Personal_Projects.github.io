---
title: RFM Segmentation for Customer Analytics
date: 2025-04-24
category: framework
tags:
  - rfm
  - segmentation
  - customer-analytics
  - sql
excerpt: A practical framework for RFM segmentation — Recency, Frequency, Monetary — and how to turn scores into action.
draft: false
---

# RFM Segmentation for Customer Analytics

RFM segmentation splits customers along three dimensions:

- **Recency** — how recently did they buy?
- **Frequency** — how often do they buy?
- **Monetary** — how much have they spent?

It is simple, interpretable, and works with almost any transactional data.

## Calculating RFM Scores

For each customer, compute:

```sql
SELECT
  customer_id,
  DATEDIFF(CURRENT_DATE, MAX(order_date)) AS recency,
  COUNT(DISTINCT order_id) AS frequency,
  SUM(amount) AS monetary
FROM orders
WHERE order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY customer_id;
```

Then assign scores from 1 to 5 for each metric. Higher scores are better for Frequency and Monetary, but for Recency a lower value means a better score.

## Turning Scores into Segments

A common approach:

| Segment | Pattern | Action |
|---------|---------|--------|
| Champions | R=5, F=5, M=5 | Loyalty programs, early access |
| At Risk | R=1–2, F/M high | Win-back campaigns |
| New Customers | R=5, F/M low | Onboarding, first-repeat offers |
| Hibernating | R=1, F=1, M=1 | Cheap reactivation or ignore |

## From Scores to Strategy

The main value of RFM is not the labels — it is that different segments justify different costs of contact. Champions can receive expensive personalized offers. Hibernating users get only low-cost channels, if any.

## Watch Out For

- **Skewed Monetary.** A few whales can dominate the distribution. Use quintiles, not absolute thresholds.
- **Static view.** RFM should be refreshed monthly or quarterly.
- **Action bias.** Labeling a customer as "At Risk" only helps if you have a specific plan for them.

RFM is a starting point, not the final answer. Combine it with product usage, support tickets, and channel preferences to make the segmentation richer.
