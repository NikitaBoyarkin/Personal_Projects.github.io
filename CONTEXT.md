# Portfolio Site (Personal_Projects.github.io)

Персональный портфолио-сайт продуктового/data-аналитика: статический Astro, GitHub Pages, PostHog-аналитика. Этот контекст описывает язык конверсионной поверхности главной и метрик.

## Конверсионная поверхность

**Capabilities surface**:
Конверсионная «concrete»-поверхность главной, показывающая конкретные результаты (не абстрактные бейджи). Исторически — CapabilitiesGrid (удалён, ADR-0001); сейчас — featured project card + bento + доска проектов.
_Avoid_: skill grid, capabilities grid, бейджи навыков

**Featured project**:
Карточка флагманского кейса в hero (сейчас TaskFlow/PostHog), несущая основной «concrete»-сигнал главной. Событие `featured_project`.
_Avoid_: hero project, showcase card

**Bento**:
Сетка секций главной под hero: CareerSnapshot, Stack, Knowledge Graph, Notes, ReadingBlock. События `bento_stack`/`bento_graph`/`bento_notes`.
_Avoid_: bento grid (только имя секции), dashboard

## Контакт и CTA

**Hero CTA**:
Primary-действие в hero: «Смотреть проекты» / «See my work» (событие `hero_projects`). Вторичные — «Связаться» (`hero_contact`), «CV» (`hero_cv`). Компонент детерминирован (A/B `hero_cta_variant` снят 13.09).
_Avoid_: hero CTA variant, A/B CTA

**Contact action**:
Любое событие, означающее контакт-инициативу: `cv_footer`, `cv_download_pdf`, `cv_pdf_footer`, `github_footer`, `linkedin_footer`, `hero_cv`. `hero_projects` контактом НЕ является (переход в проекты).
_Avoid_: click, conversion event (неспецифично)

## Метрики

**Traffic gate**:
Порог ≥100 уник. визитов/90д, ниже которого конверсионные метрики статистически незначимы. Ниже порога конверсия трекается, но не принимаются решения (track-only).
_Avoid_: порог значимости (общий термин)

**Track-only metric**:
Метрика, которая мониторится, но не гейтит решений, пока выборка не набрана.
_Avoid_: watch metric, KP-флаг