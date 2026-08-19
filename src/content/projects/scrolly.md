---
title: Scrolly English Speaking
description: "Scrollytelling-гайд по улучшению spoken English для рабочих разговоров (A2–B1) — построен на Astro 6 с MDX-нарративом и D3-визуализациями. Контент и визуализации разделены: MDX хранит текст, data-модули — структуру секций и props визуализаций."
hero: images/scrolly.svg
impact:
  - Scrollytelling-нарратив на Astro 6 + MDX, D3-визуализации (workflow, bars, calendar, checklist)
  - Контент и визуализации разделены — доверенный data-модуль, frontmatter безопасно мёржится
  - Интерактивные viz-панели через IntersectionObserver + dark/light тема + reduced-motion
  - Деплой на GitHub Pages по subpath, Node 22, `astro check` в CI
tools:
  - Astro
  - TypeScript
  - MDX
  - D3
  - Tailwind v4
github: https://github.com/NikitaBoyarkin/scrolly-english-speaking
---

# Scrolly English Speaking

## Business Context

Рабочие разговоры на английском (стендапы, синки, интервью) — слабое место у многих русскоязычных специалистов уровня A2–B1: грамматика есть, но связный speech и реакции в реальном времени буксуют. Обычный учебник этому не учит: нет контекста, нет наглядности, нет связи между фразами и ситуацией. Задача — собрать не статью, а интерактивный гайд, где нарратив ведёт читателя по сценам рабочего разговора, а визуализации показывают, как устроены workflow, инструменты и метрики прогресса.

## Hypothesis

Если подать материал как scrollytelling — текст в левой колонке, визуализации в правой, переключаемые по скроллу через IntersectionObserver — читатель увидит не список советов, а связную историю. Разделение контента (MDX-нарратив) и визуализаций (data-модули + D3-рендереры) сделает гайд легко расширяемым: новая сцена = новый data-файл + MDX, без правки рендеринга.

## Data & Method

**Стек:** Astro 6 (`output: static`) + MDX + Tailwind v4 (через `@tailwindcss/vite`), D3 v7 для визуализаций, Shiki (тема `nord`) для кода, `@astrojs/sitemap`. Деплой на GitHub Pages по subpath, Node 22.

**Архитектура:**
- `src/layouts/ScrollyLayout.astro` — единый шаблон: hero, 2-колоночный scrolly, viz-панели, head-мета.
- `src/posts/scrolly/*.mdx` — нарратив (текст разделов) с `<ScrollySection>` блоками.
- `src/scrolly/data/*.ts` — `configId` + секции + props визуализаций + тема. Доверенный источник HTML: hero/footer всегда берётся из data-модуля, никогда из frontmatter — защита от инъекций.
- `src/scrolly/scrolly-runtime.ts` — IntersectionObserver, `switchViz`, theme-toggle; viz-рендереры через lazy import.

**Модель контента:** MDX-frontmatter (`configId`, `metadata`, `theme`) безопасно мёржится поверх доверенного data-модуля. HTML hero/footer всегда из `data/*.ts`, never из frontmatter.

## Insight

Сила scrollytelling — в синхронизации нарратива и визуализации: читатель доходит до абзаца, и в этот момент справа меняется график. Это удерживает внимание лучше, чем статичная статья с картинками. А разделение MDX и data-модулей решает главную боль статических сайтов — смешивание текста и логики: нарратив остаётся редактируемым в Markdown, а визуализации — типизированными в TypeScript.

## Impact

- **Scrollytelling-нарратив** — 2-колоночный layout, viz-панели переключаются по скроллу через IntersectionObserver.
- **D3-визуализации** — workflow, tools, bars, resources, metrics, calendar, checklist.
- **Разделение контента и визуализаций** — MDX-нарратив + доверенные data-модули; frontmatter безопасно мёржится, HTML hero/footer только из data.
- **Тёмная/светлая тема + reduced-motion** — доступность и комфорт чтения.

## Documentation

- [Живая страница →](https://nikitaboyarkin.github.io/scrolly-english-speaking/english-speaking)
- [GitHub → scrolly-english-speaking](https://github.com/NikitaBoyarkin/scrolly-english-speaking)