---
title: Automating Weekly Reports with a Telegram Bot
date: 2025-05-08
category: decision-log
tags:
  - automation
  - telegram
  - reporting
  - python
excerpt: Why we moved weekly metric reports from manual slides to a scheduled Telegram bot and what we learned.
draft: false
---

# Automating Weekly Reports with a Telegram Bot

Weekly reporting is one of those tasks that looks small but eats time. Every Monday someone pulls numbers from SQL, copies screenshots, writes a summary, and sends it to a channel. We decided to automate it with a Telegram bot.

## The Problem with Manual Reports

Manual reporting has hidden costs:

- It depends on one person.
- It arrives inconsistently.
- Formatting drifts over time.
- People spend time copying numbers instead of interpreting them.

## What the Bot Does

Every Monday at 9:00 the bot:

1. Connects to the data warehouse and runs predefined SQL queries.
2. Calculates week-over-week and year-over-year changes.
3. Formats the output into a compact message with key numbers.
4. Sends it to the team channel.
5. Logs the run so failures are visible.

A `/report` command lets anyone request the latest version manually.

## Why Telegram

The team already used Telegram for daily communication. Adding reports there removed friction: no new tool, no login, no email filters. The report lives where people actually check messages.

## Lessons Learned

- **Reliability matters more than formatting.** A broken bot destroys trust faster than an ugly report.
- **Fallback is essential.** If the database is down, the bot should say so explicitly, not stay silent.
- **Keep it scannable.** One message with 5–7 metrics beats a long document.

## When Not to Do It

If the audience needs deep context, interactive slicing, or formal governance, a bot is not enough. Use it for operational snapshots, not board decks.
