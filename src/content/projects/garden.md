---
title: Digital Garden
description: "Личный цифровой сад и Zettelkasten, опубликованный как сайт на Quartz v4: связанные заметки, бэклинки и граф вместо хронологической ленты блога."
track: engineering
hero: images/garden.svg
impact:
  - Linked-notes Zettelkasten with backlinks + graph view
  - Atomic evergreen notes over chronological posts
  - Quartz v4 — TypeScript-extensible, static output
  - Obsidian-flavored Markdown → public site
tools:
  - TypeScript
  - Quartz v4
  - Markdown
  - Obsidian
github: https://github.com/NikitaBoyarkin/digital_garden
updated: 2026-08-12
related:
  - /projects/site/
  - /projects/scrolly/
---

# Digital Garden

## Контекст

Знания в виде хронологических постов быстро устаревают и теряют связи. Цифровой сад (digital garden) — противоположность блогу: заметки не упорядочены по дате, а связаны `[[wikilinks]]`, имеют стадии зрелости (seedling → evergreen) и развиваются со временем. Задача — опубликовать личный Zettelkasten как статический сайт с графом связей.

## Гипотеза

Если опубликовать заметки через Quartz v4 с backlinks, graph view и full-text search, читатель увидит не отдельные тексты, а сеть идей — и сможет переходить по смыслу, а не по хронологии. Это ближе к тому, как мысли реально устроены, чем лента постов.

## Данные и метод

**Модель контента:** атомарные заметки в Obsidian-flavored Markdown. Каждая заметка — одна идея, с YAML frontmatter, тегами и `[[wikilinks]]` на соседние понятия.

**Quartz v4:**
- TypeScript-плагины для рендеринга — расширяемость из коробки.
- Backlinks: для каждой заметки показываются все, кто на неё ссылается.
- Graph view: визуализация графа заметок (nodes = notes, edges = links).
- Full-text search, popover-превью при наведении на `[[wikilink]]`.
- Статический вывод — хостинг на GitHub Pages, без сервера.

## Что нашли

Сила цифрового сада — в связях, не в отдельных заметках. Backlinks делают заметку «узлом» и показывают, в какие контексты она включена. Граф превращает накопление заметок в навигируемую структуру: видно кластеры тем и изолированные островки. Хронологический блог отвечает на «когда», сад — на «как это связано».

## Эффект

- **Linked-notes Zettelkasten** — backlinks + graph view вместо ленты постов.
- **Атомарные evergreen-заметки** — контент созревает, а не устаревает по дате.
- **Quartz v4 на TypeScript** — статический вывод, расширяемые плагины, без сервера.
- **Obsidian-flavored Markdown → публичный сайт** — один источник, два потребления.

## Документация

- [GitHub → digital_garden](https://github.com/NikitaBoyarkin/digital_garden)