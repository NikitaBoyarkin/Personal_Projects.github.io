---
title: RFM Analysis of Bank Clients
description: RFM analysis of bank clients to segment users by Recency, Frequency, and Monetary metrics. Surfaced key customer groups, optimized marketing campaigns, and improved retention efficiency.
track: analytics
hero: images/rfm.svg
impact:
  - Identified high-value customer segments
  - Optimized marketing campaigns
  - Improved retention efficiency
tools:
  - Python
  - SQL
  - Tableau
github: https://github.com/NikitaBoyarkin/rfm-analysis-of-bank-clients
demo: demos/rfm/index.html
related:
  - /posts/rfm-segmentation-practical/
---

# RFM Analysis of Bank Clients

## Business Context

Банк накапливает данные о транзакциях клиентов, но маркетинговые кампании работали «в лоб»: одинаковые предложения для всех. Задача — разделить клиентскую базу на однородные сегменты, чтобы персонализировать коммуникацию и сосредоточить ресурсы на самых ценных клиентах.

## Hypothesis

Если сегментировать клиентов по трём измерениям — **Recency** (когда последняя покупка), **Frequency** (частота операций) и **Monetary** (совокупный доход) — можно выделить группы с разным поведением и для каждой построить отдельную стратегию удержания и развития.

## Data & Method

**Данные:** транзакционная история клиентов банка, включая дату операции, сумму и тип транзакции.

**Шаги анализа:**
1. **Очистка и подготовка данных** — устранены дубликаты, обработаны пропуски, отобраны релевантные типы операций.
2. **Расчёт RFM-метрик** для каждого клиента:
   - Recency: дней с последней транзакции
   - Frequency: количество операций за период
   - Monetary: суммарный доход от клиента
3. **Кластеризация по RFM-score** — каждому измерению присвоен балл, клиенты объединены в сегменты.
4. **Визуализация распределения сегментов** в Tableau с фильтрами по времени и продукту.

**Инструменты:** Python (Pandas, Scikit-learn), SQL, Tableau.

## Insight

Вышли четыре группы:

- **High-value customers** — недавние, частые и высокодоходные клиенты. Основной вклад в выручку.
- **Medium-value customers** — умеренная активность и доход. Потенциал роста через upsell.
- **Low-value customers** — редкие и низкодоходные. Неэффективно вкладывать в дорогие каналы.
- **At-risk customers** — ранее активные, но давно не совершавшие покупок. Требуют реактивации.

Главное, что видно: небольшая доля high-value клиентов приносит непропорционально большую часть дохода, а at-risk сегмент тает быстрее, чем растёт приток новых.

## Impact

- **Выделены высокодоходные сегменты** — маркетинг получил понятные persona для таргетирования.
- **Бюджет перераспределён** — в пользу retention high-value и реактивации at-risk.
- **Удержание стало точечным** — команды перешли от массовых рассылок к сегментированным сценариям.

## Documentation

- [GitHub → rfm-analysis-of-bank-clients](https://github.com/NikitaBoyarkin/rfm-analysis-of-bank-clients)
