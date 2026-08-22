---
title: Reporting Automation Telegram Bot
description: A Telegram bot that automates weekly reporting and integrates with external APIs. Cuts time on routine tasks, ensures timely delivery of key metrics, and improves team communication.
track: engineering
hero: images/bot.svg
impact:
  - Cut weekly report prep from 1–2h to automated cron
  - KPI table + sparklines delivered on schedule
  - Fallback notifications on source failures
  - Single consolidated pipeline replacing fragmented sources
tools:
  - Python
  - aiogram / telegram-bot
  - SQL
  - cron scheduler
  - Tableau
github: https://github.com/NikitaBoyarkin/telegram_bot_public
related:
  - /posts/telegram-reporting-bot/
---

# Reporting Automation Telegram Bot

## Business Context

Every week an analyst manually gathered metrics from several sources, refreshed a dashboard, exported screenshots, and posted them to the team chat. The process took 1–2 hours, was often delayed, and depended on a single person. The task: automate report preparation and delivery.

## Hypothesis

If we move weekly report assembly into a Telegram bot that fetches data, builds the message, and sends it on a schedule, the team saves analyst time and gets metrics regularly and in a consistent format.

## Data & Method

**Data:** product metrics from a database (SQL), external APIs, and ready-made Tableau dashboards.

**Bot architecture:**
1. **Scheduler** — cron-triggered at a set time.
2. **Data collection** — SQL queries to the data mart, aggregation of key KPIs (DAU, ARPU, conversion, retention).
3. **Report assembly** — a template with a KPI table, sparklines, and week-over-week comparison (delta in % and pp).
4. **Delivery** — Telegram Bot API to a chat or via the `/report` command.
5. **Reliability** — error handling, logging, fallback notifications on source failures (important: a silent-fall of the bot erodes trust in metrics faster than the time savings grow).

**Tools:** Python (aiogram/telegram-bot), SQL, cron, Tableau for visualization.

## Insight

Manual report assembly turned out to be less complex than fragmented: metrics had to be pulled from different places. After consolidation into one pipeline, most of the work moved to the machine, and the analyst became responsible for interpretation rather than copying numbers.

Key insight: delivery stability matters more than report polish. If the bot fails silently, trust in metrics drops faster than the time savings grow — so fallback notifications on source failure are built into the architecture rather than added "later."

## Impact

- **Report prep time cut** — manual 1–2h assembly replaced by automated cron.
- **Timely metric delivery** — reports arrive on schedule regardless of analyst workload.
- **Team communication improved** — everyone sees the same numbers (KPI + sparklines + delta) in one format and place.
- **Silent-fail protection** — fallback notifications on source failures preserve trust in metrics.

## Documentation

- [GitHub → telegram_bot_public](https://github.com/NikitaBoyarkin/telegram_bot_public)