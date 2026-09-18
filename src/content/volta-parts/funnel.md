---
title: Volta — Funnel Analysis
description: "Воронка онбординга необанка: KYC — узкое место с 56,6% step conversion, регистрация теряет больше всех в абсолюте (2 682 пользователя). Разбивка по каналам и платформам."
part: funnel
order: 1
impact:
  - KYC Complete — largest relative drop-off (56.6% step conv)
  - Registration — largest absolute loss (2,682 users, 73.2% step conv)
  - Referral +11.7pp over paid social; iOS 13.6% vs Android 11.7% end-to-end
tools:
  - Python
  - pandas / NumPy
  - Matplotlib / Seaborn
  - SciPy
github: https://github.com/NikitaBoyarkin/volta-banking
---

# Volta — Funnel Analysis

## Контекст

Первый проект петли **discover**: найти, где необанк «Volta» теряет пользователей в онбординге. Данные синтетические, seeded-генератор → воспроизводимые CSV.

## Гипотеза

Узкое место онбординга — этап KYC: наибольший относительный отток среди шагов воронки.

## Данные и метод

- Step conversion и absolute/relative drop-off по каждому шагу воронки (Sign-up → KYC → Funded → Active).
- Chi-square тест различий каналов привлечения.
- Сравнение платформ (iOS vs Android) и каналов (referral vs paid social) на каждом шаге.

## Что нашли

- **KYC Complete** — наибольший относительный отток: **56.6% step conversion** (теряет больше всего доли на одном шаге).
- **Registration** — наибольший абсолютный отток: **2 682 пользователя, 73.2% step conv**.
- **Referral** конвертирует на **+11.7pp** лучше paid social.
- **iOS** обгоняет Android на каждом шаге: **13.6% vs 11.7%** end-to-end.

KYC — критическое узкое место. Этот вывод передаёт эстафету следующему проекту — A/B-тесту progress bar для KYC.

## Эффект

- Локализовано узкое место онбординга (KYC) — основа для A/B-эксперимента.
- Количественная база по каналам и платформам для приоритизации роста.

## Документация

- [GitHub → volta-banking](https://github.com/NikitaBoyarkin/volta-banking)