---
title: Product Analytics Dashboard (Streamlit)
description: A self-contained product analytics dashboard on a synthetic SaaS dataset (8,000 users). Covers the AARRR funnel, cohort retention, revenue, and user segmentation.
hero: images/streamlit.svg
impact:
  - 8,000 synthetic users, Jan 2024 – Jun 2025, deterministic seed = 42
  - "AARRR funnel: app_open → signup → activate → start_trial → subscribe with step drop-off"
  - Cohort retention heatmap (signup month × months since signup)
  - "Revenue: MRR growth, MRR by plan, ARPU, logo churn"
  - "Segments: distributions + conversion + ARPU by segment / channel / country / device"
tools:
  - Python
  - Streamlit
  - pandas / NumPy
github: https://github.com/NikitaBoyarkin/streamlit-app
private: true
related:
  - /projects/supabase/
caseStudy:
  problem: "На собеседованиях по product-аналитике ожидают рассуждений по всей AARRR-рамке — acquisition, activation, retention, revenue — но большинство портфолио показывают одну метрику изолированно."
  approach: "Собрал multipage Streamlit-дашборд на одном синтетическом SaaS-датасете (8 000 пользователей, детерминированный seed = 42), разделяемом между страницами через @st.cache_data — датасет идентичен между запусками. Каждая страница отвечает на один AARRR-вопрос: Overview (KPI, DAU, signup, конверсия по каналам), Funnel (5-шаговый drop-off), Retention (cohort-heatmap), Revenue (MRR/ARPU/churn), Segments (конверсия и ARPU по сегменту/каналу/стране/устройству)."
  result: "Одно self-contained приложение позволяет рекрутеру пройти весь AARRR-сюжет на одном согласованном датасете. Детерминированный seed делает числа воспроизводимыми, а тот же UI позже переиспользован как слой презентации для full-stack Supabase-проекта — изменился только слой данных."
  metrics:
    - label: "Пользователей"
      value: "8 000"
    - label: "Страниц"
      value: "5"
    - label: "Seed"
      value: "42 (детермин.)"
    - label: "Воспроизводимость"
      value: "да"
---

# Product Analytics Dashboard (Streamlit)

## Business Context

Аналитическое портфолио должно показывать весь AARRR-цикл на одном согласованном датасете, а не одну метрику изолированно. Этот дашборд — self-contained приложение: данные генерируются детерминированно, метрики воспроизводимы между запусками.

## Pages

| Page | Что показывает |
|------|----------------|
| Overview | KPI (users, paid, MRR, active 30d, stickiness), DAU trend, monthly signups, conversion by channel |
| Funnel | `app_open → signup → activate → start_trial → subscribe` с пошаговым drop-off |
| Retention | Cohort retention heatmap (месяц signup × месяцев с момента signup) |
| Revenue | MRR growth, MRR by plan, ARPU, logo churn |
| Segments | Распределения + конверсия + ARPU по сегменту / каналу / стране / устройству |

## Data & Method

**Данные:** синтетический SaaS-датасет, 8 000 пользователей, Jan 2024 – Jun 2025. Генерируется in-memory с детерминированным seed = 42 и кэшируется через `@st.cache_data` — датасет идентичен между запусками и разделяем между страницами в сессии.

**Запуск:**

```bash
uv sync
uv run streamlit run app.py
```

## Insight

Одна согласованная база для всех AARRR-вопросов — это и есть суть. Детерминированный seed означает, что Funnel, Retention, Revenue и Segments говорят об одних и тех же пользователях, а числа можно проверить. Позже этот же UI стал слоем презентации для full-stack Supabase-проекта — сменился только слой данных.

## Impact

- **Весь AARRR** — 5 страниц на одном датасете из 8 000 пользователей.
- **Воспроизводимость** — детерминированный seed = 42, `@st.cache_data`.
- **Переиспользование UI** — слой презентации перенесён в Supabase-проект.
- **Self-contained** — без внешних зависимостей данных, запускается одной командой.

## Documentation

- [GitHub → streamlit-app](https://github.com/NikitaBoyarkin/streamlit-app)