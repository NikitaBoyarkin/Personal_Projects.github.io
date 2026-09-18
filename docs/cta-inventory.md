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
| 13 | about.astro (#work) | «Обсудить формат →» | `work_with_me_cta` | tg deep-link |
| 14 | about.astro (links footer) | «Написать в Telegram →» | `whois_cta` | tg deep-link |
| 15 | cv.astro | «Download PDF» | `cv_download_pdf` | `CV-Nikita-Boyarkin.pdf` |
| 16 | cv.astro | «Source (GitHub)» | `cv_source_github` | `github.com/NikitaBoyarkin/cv` |
| 17 | games (`/games/`) | LinkedIn / Telegram (contact-секция) | `contact_click` (channel) | внешние |
| 18 | AskMe (главная) | «Спросить» (открывает панель) | `ask_me_open` | — (панель) |
| 19 | SearchBox (header) | «Поиск» (открывает панель) | `search_open` | — (панель) |
| 20 | ProjectCard | «Смотреть» / «Demo» / «GitHub» | `project_view_<slug>` / `project_demo_<slug>` / `project_github_<slug>` | внутренние + внешние |
| 21 | HeadlineCases (главная, PRD v6 S2.6) | 3 кейса + сжатый список 14 | `headline_case_<slug>` / `headline_demo_<slug>` / `headline_github_<slug>` / `headline_all_projects` / `more_project_<slug>` | внутренние проекты + внешние артефакты |

## Гэпы, найденные аудитом

| Гэп | Статус |
|---|---|
| Hero-CTA «С чего начать» и «CV» не имели трекинга | ✅ закрыт 2026-09-09: `hero_cta_click`/`hero_cta_exposure` (A/B) + `hero_cv` |
| Ссылки внутри панели AskMe не трекаются (только `ask_me_open`) | ⏳ опционально: `ask_me_link_<label>` |
| `start.astro` — удалён (S1.4); маршрутизация перенесена в jump-nav на `/about` | ✅ закрыт 2026-09-18 |

## A/B-тест главного CTA

**Флаг:** `hero_cta_variant` (PostHog, id 872930, client-side, 50/50).

| Вариант | Текст | Href | Гипотеза |
|---|---|---|---|
| `control` | «С чего начать» / «Start here» | `/start/` | статус-кво |
| `projects` | «Смотреть проекты» / «See my work» | `/projects/` | рекрутер хочет увидеть работу (доказательство), а не маршрутизатор → выше вход в фаннел главная→/projects/→контакт |

**События:** `hero_cta_exposure` (variant, 1/загрузку) — знаменатель; `hero_cta_click` (variant, path) — числитель. Метрика: CTR exposure→click; вторично — вход в фаннел «Рекрутер».

**Решение:** зафиксировать в PostHog (insight по `hero_cta_click` с breakdown по variant) после накопления ≥30 exposure на руку (~2–4 недели при текущем трафике). Победитель — по CTR с учётом SRM (проверка распределения exposure 50/50).

**Реализация:** `src/components/HeroCta.astro` (bundled script, `posthog.onFeatureFlags` → swap text/href, no-JS = control). Трекинг явный, без `data-analytics` (иначе двойной счёт через delegated capture в Analytics.astro).

## S1.2/S1.4 Consolidation mapping (2026-09-18)

The about-cluster (`whois`, `work-with-me`, `now`, `start`) collapsed into `/about` + `/value`.
Redirects in `astro.config.mjs`:

| Old route | Redirect target |
|---|---|
| `/whois/` | `/about/#who` |
| `/work-with-me/` | `/about/#work` |
| `/now/` | `/about/#now` |
| `/start/` | `/about/#start` |
| `/en/whois/` | `/en/about/#who` |
| `/en/work-with-me/` | `/en/about/#work` |
| `/en/start/` | `/en/about/#start` |

(`en/now.astro` never existed — no `/en/now/` redirect.)

**Analytics event preservation (G14 funnel):**

| Event | Old host | New host | Status |
|---|---|---|---|
| `whois_cta` | `whois.astro` (deleted) | `about.astro` links-footer CTA | preserved |
| `work_with_me_cta` | `work-with-me.astro` (deleted) | `about.astro` #work section CTA | preserved |
| `value_cta` | `value.astro` | `value.astro` (unchanged) | preserved |
| `value_github` | `value.astro` | `value.astro` (unchanged) | preserved |

No wired event was dropped. `start.astro` carried no `data-analytics` event, so its deletion
removes no funnel signal.
