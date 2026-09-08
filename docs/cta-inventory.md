# CTA-инвентарь (REQ-037)

Аудит всех контакт-CTA сайта: локация, текст, событие, целевой URL. Обновлять при добавлении/изменении CTA.

## Инвентарь

| # | Локация | Текст CTA | Событие PostHog | Целевой URL |
|---|---|---|---|---|
| 1 | Hero (index, RU+EN) | «С чего начать» / «Start here» (A/B: «Смотреть проекты» / «See my work») | `hero_cta_click` + `hero_cta_exposure` (variant) | `/start/` (A/B: `/projects/`) |
| 2 | Hero (index) | «CV» | `hero_cv` | `/cv/` |
| 3 | Hero (index) | «Скачать PDF» / «Download PDF» | `cv_download_pdf` | `CV-Nikita-Boyarkin.pdf` |
| 4 | Hero (index) | GitHub / LinkedIn | `github_hero` / `linkedin_hero` | внешние |
| 5 | Header nav | Telegram-иконка | `telegram_header` | `t.me/lofinibo` |
| 6 | Footer | GitHub · LinkedIn · Telegram · CV · PDF · Writing | `github_footer` / `linkedin_footer` / `telegram_footer` / `cv_footer` / `cv_pdf_footer` / `writing_footer` | внешние + внутренние |
| 7 | HomeBoard (главная) | Telegram / GitHub / LinkedIn | `telegram_board` / `github_board` / `linkedin_board` | внешние |
| 8 | contact.astro | «Telegram: @lofinibo» | `telegram_contact` | `t.me/lofinibo` |
| 9 | contact.astro | «Написать с контекстом →» | `telegram_deeplink` | tg deep-link |
| 10 | contact.astro | «CV (PDF)» | `cv_download_pdf` | `CV-Nikita-Boyarkin.pdf` |
| 11 | value.astro | «Написать в Telegram →» | `value_cta` | tg deep-link |
| 12 | value.astro | «GitHub →» | `value_github` | `github.com/NikitaBoyarkin` |
| 13 | work-with-me.astro | «Обсудить формат →» | `work_with_me_cta` | tg deep-link |
| 14 | whois.astro | «Написать в Telegram →» | `whois_cta` | tg deep-link |
| 15 | cv.astro | «Download PDF» | `cv_download_pdf` | `CV-Nikita-Boyarkin.pdf` |
| 16 | cv.astro | «Source (GitHub)» | `cv_source_github` | `github.com/NikitaBoyarkin/cv` |
| 17 | games (`/games/`) | LinkedIn / Telegram (contact-секция) | `contact_click` (channel) | внешние |
| 18 | AskMe (главная) | «Спросить» (открывает панель) | `ask_me_open` | — (панель) |
| 19 | SearchBox (header) | «Поиск» (открывает панель) | `search_open` | — (панель) |
| 20 | ProjectCard | «Смотреть» / «Demo» / «GitHub» | `project_view_<slug>` / `project_demo_<slug>` / `project_github_<slug>` | внутренние + внешние |

## Гэпы, найденные аудитом

| Гэп | Статус |
|---|---|
| Hero-CTA «С чего начать» и «CV» не имели трекинга | ✅ закрыт 2026-09-09: `hero_cta_click`/`hero_cta_exposure` (A/B) + `hero_cv` |
| Ссылки внутри панели AskMe не трекаются (только `ask_me_open`) | ⏳ опционально: `ask_me_link_<label>` |
| `start.astro` — маршрутизатор без CTA-событий (ссылки на CV/Volta/contact) | ⏳ опционально: `start_<target>` |

## A/B-тест главного CTA

**Флаг:** `hero_cta_variant` (PostHog, id 872930, client-side, 50/50).

| Вариант | Текст | Href | Гипотеза |
|---|---|---|---|
| `control` | «С чего начать» / «Start here» | `/start/` | статус-кво |
| `projects` | «Смотреть проекты» / «See my work» | `/projects/` | рекрутер хочет увидеть работу (доказательство), а не маршрутизатор → выше вход в фаннел главная→/projects/→контакт |

**События:** `hero_cta_exposure` (variant, 1/загрузку) — знаменатель; `hero_cta_click` (variant, path) — числитель. Метрика: CTR exposure→click; вторично — вход в фаннел «Рекрутер».

**Решение:** зафиксировать в PostHog (insight по `hero_cta_click` с breakdown по variant) после накопления ≥30 exposure на руку (~2–4 недели при текущем трафике). Победитель — по CTR с учётом SRM (проверка распределения exposure 50/50).

**Реализация:** `src/components/HeroCta.astro` (bundled script, `posthog.onFeatureFlags` → swap text/href, no-JS = control). Трекинг явный, без `data-analytics` (иначе двойной счёт через delegated capture в Analytics.astro).
