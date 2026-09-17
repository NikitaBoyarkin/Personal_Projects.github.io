# PRD v6 — Portfolio Signal Consolidation

| Field | Value |
|---|---|
| Status | Draft — ready for execution |
| Date | 2026-09-17 |
| Owner | Nikita Boyarkin |
| Supersedes | `docs/prd-v4.md`, `docs/prd-v5.md` (both marked superseded) |
| Inherits | `docs/prd-v5.md` §2.2 red flags F1–F7 (F1 already RESOLVED as-built; F4–F6 are repo-side — see §5.1) and §3 Goals 13–16, quoted verbatim in §3.2 |
| Scope | This document only. It does not restate v5's goals or phases. |

---

## 0. How to read this document

This is an **execution PRD**, not a strategy document. Its job is to record the decisions taken on
2026-09-17 and turn them into work with verifiable acceptance criteria.

Three rules apply:

1. **v5 stays in force.** Its four goals are inherited unchanged and quoted verbatim in §3.2, so this
   document can be executed without opening v5. Do not re-derive or re-open them.
2. **Every task carries an acceptance criterion that fails when the task is not done.** If a task
   cannot be checked mechanically, it says so explicitly.
3. **Evidence classes are marked.** `[V]` verified by reading the file. `[I]` inferred from verified
   evidence. `[NV]` not verified. Never upgrade `[I]` to `[V]` in a report.

### Precondition — capture baseline first

**Task S1.0 must run before any other task.** Without a baseline, none of the sprint-3 metrics can be
evaluated, and the consolidation cannot be attributed.

---

## 1. Context

### 1.1 What the audit found

The portfolio site is **not underbuilt. It is overbuilt relative to the signal it carries.** `[V]`

Present and working today:

| Capability | Status |
|---|---|
| 16 project case studies (RU), mirrored 1:1 in EN | `[V]` working |
| Full problem→approach→result + metric tiles on Volta, AB, SQL, Supabase, PostHog, Streamlit, Sales-calls, ML, Bot, Games | `[V]` working |
| Interactive knowledge graph (`KnowledgeGraph.astro`) + 1-hop mini-graph on every project page (`ProjectGraph.astro`) | `[V]` working |
| Three themes (dark `#0f2a2b` teal base / light / cyberpunk), no-flash init, localStorage | `[V]` working |
| `llms.txt` at `/llms.txt` and `/.well-known/llms.txt` | `[V]` working |
| `robots.txt` explicitly allowing 14 AI crawlers | `[V]` working |
| JSON-LD: Person, ItemList, Article, FAQPage, BreadcrumbList, ProfilePage, CreativeWork | `[V]` working |
| 24 generated OG images (`.png` + `.webp`) + generators | `[V]` working |
| i18n sitemap, RSS, Google Search Console verification | `[V]` working |
| PostHog with 19 wired `data-analytics` events + `project_viewed`/`post_read`/`*_viewed` | `[V]` working |
| Lighthouse CI in the deploy workflow, `make check` (`scripts/check_site.py`), `bun test` suite | `[V]` working |
| Light-themed standalone `/cv/` page + `public/CV-Nikita-Boyarkin.pdf` + generator | `[V]` working |
| Editorial type system: Cormorant (display) + Inter (sans), self-hosted variable, 4 subsets, 60-30-10 palette with a contrast gate | `[V]` working |

Measured traffic `[V]` from v5 §2.3:

- **54 unique visitors / 90 days**
- **5.56% visit→contact** (sample <100 — treat as noise, not a rate)
- median 36 s to contact
- referrers: GitHub (main), LinkedIn **≈ 0**

Route count `[V]`: 13 RU page routes + 12 EN page routes before consolidation.

### 1.2 What this means

Three separate problems were being treated as one. The site's *visual* layer is ahead of almost every
comparable portfolio. Its *credibility* layer is behind. And its *route count* exceeds what three
skills' worth of proof requires.

The relevant lesson from `jeremy-meidinger.de` is therefore **not** visual. That site is a founder's
landing page: one nav word per concern, one active company, one fresh post, and a `Technical Founder //
Cologne` line that does the positioning work. Its discipline is **reduction of surface area**. Copying
its tilde-prefixed file-system framing would read as a costume; copying its willingness to show less
would not.

**Consequence: the previous five PRDs, and most of what a redesign PRD would normally contain, are
already done.** Typography, palette, themes, OG images, structured data, AI-crawler policy, CV page —
all shipped. A sixth PRD about visual work would duplicate effort. This document is about subtraction
and credibility.

---

## 2. Problem statements

### P1 — Page sprawl: seven routes for what is three pages of content `[V]`

The personal layer carries seven routes: `whois`, `value`, `work-with-me`, `about`, `now`, `start`,
`contact`.

Verified duplication:

| Overlap | Evidence |
|---|---|
| `about.astro` "Сейчас" ↔ `now.astro` | **3 of 5 bullets byte-identical** (`Готовлюсь к BI / Data Analyst…`, `Поддерживаю Obsidian knowledge base…`, `Экспериментирую с AI-assisted…`). `now` adds only the "Обновлено · 2026-09-08" date and one "Читаю: Designing Machine Learning Systems" line. 55 words, 9 days stale |
| `whois.astro` ↔ `about.astro` | Same identity sentence ("data / product analyst, 4+ года · фокус — эксперименты, retention, сегментация"). `whois` is 70 words |
| Reproducibility sentence | Paraphrased on `whois` ("Как работаю"), `work-with-me` ("Reproducibility — вывод можно перепроверить: код + SQL + метрики"), `about` ("воспроизводимой статистической методологией") |
| `notes.astro` ↔ `guides.astro` | Structural twins — same `BlogCard` component, same chrome, same CTA footer, differing only by `category` filter and one intro sentence. ~20 words of static chrome each |

`start.astro` is 45 words, a pure link list, carries no `data-analytics` attribute, and has **exactly
one inbound link** (`src/pages/contact.astro:23`). `[V]`

### P2 — Credibility gap: an experience claim with nothing behind it `[V]`

The CV and personal pages claim **"4+ года"** of experience. There is **no employment history
anywhere** on the site or in the CV `[V]`, and every case study rests on synthetic data (`fit-trek`
15k generated users, `supabase` seed 8000, `sales-calls` 16 891 synthetic calls, `sql` ~183k synthetic
events, `streamlit` 8 000 users). v5 §2.1 flags this itself.

This is the single largest risk in the whole system. A hiring manager who notices the mismatch between
a four-year claim and an empty employment section stops reading the site entirely. No amount of visual
quality recovers from that.

Unused asset `[V]`: a PhD in labour psychology, which appears nowhere on the site as a differentiator.

### P3 — Unverifiable proof: three flagship projects cannot be checked `[V]`

`supabase-product-analytics`, `posthog-saas-analytics`, and `streamlit-app` are private repositories.
Their cards render a "Смотреть на GitHub" link that leads to a private-repo notice. These are three of
the strongest product-analytics cases on the site.

Note on severity: v5 rated this **F2 / LOW**, on the grounds that none of the three is the featured
flagship — F1's switch to public `volta` (as-built 16.09) opened the main verification path. That rating
is about *blocking*, and it is correct: nothing is blocked. It is not a rating of *evidence quality*,
and on that axis these three are the strongest product-analytics cases on the site.

Consequence for measurement `[I]`: **G16 counts clicks to the repo, so a click into a private repository
counts as proof when it is not.** G16 therefore currently overstates evidence quality, and D9's
compensating artifacts are what make the goal mean what it says. This reasoning produces the new
proof-reach metric (D14, §6).

### P4 — Dead capability that misleads future agents `[V]`

`AudienceBar.astro` implements a three-way `recruiter` / `analyst` / `learner` segmented control that
stamps `html[data-audience]` and calls `window.__reorderHomeStack()`, defined at
`src/layouts/Base.astro:349–366`, which reorders `.home-stack` children by `data-order-<audience>`.
It persists to localStorage and would fire PostHog `audience_select`.

**It is imported by no page, and `.home-stack` is rendered nowhere.** The mechanism exists only in code.
No `audience_select` event has ever fired, so it is absent from the funnel.

This already caused a wrong decision in this planning session: an argument was made that aggressive
consolidation would "break the working audience router" — it would not, and the router does not work.
Dead code that looks like a feature is worse than absent code.

### P5 — Documentation and data drift `[V]`

| Drift | Location |
|---|---|
| `sqlCases: 10` vs "25 end-to-end SQL case studies" in the project text | `src/lib/metrics.ts` vs `src/content/projects/sql.md` |
| "Astro v5" vs `astro ^7.2.9` | `README.md`, `src/content/projects/site.md` |
| `button-bg: "#ff6643"` (coral) vs shipped `--button-bg: #1400c3` (indigo) | `DESIGN.md` vs `src/styles/global.css` |
| 53 build-cache JSON files tracked in git | `src/graphify-out/cache/**` |
| Committed build output that Actions rebuilds and redeploys | `dist/` |
| CLS **0.182** on `/projects/cohort/` — above the 0.1 threshold the repo's own docs set | v5 §2.4 gap 5 |
| v5 says 15 projects; `PROJECT_ORDER` lists 16 | `docs/prd-v5.md` §2.1 vs `src/lib/projects.ts` |

### P6 — The bot card links a stub repository `[V]` — v5 F3, **HIGH**

`src/content/projects/bot.md:17` points at `github.com/NikitaBoyarkin/telegram_bot_public` — a repository
holding a one-line README and no code — while the real project, `telegram_bot`, is not mentioned on the
card at all. `cv.astro` links the real one.

This is the highest-severity unresolved flag in v5 and it sits squarely in this PRD's subject: the site
promises a project and delivers an empty repository. It is also a one-line fix, which makes leaving it
open indefensible. See S1.10.

---

## 3. Goals and non-goals

### 3.1 Goals

| ID | Goal | Measure |
|---|---|---|
| G6.1 | Reduce the personal layer from 7 routes to 3, nav to ≤5 items | route count `[V]`, nav count `[V]` |
| G6.2 | Remove every unbacked experience claim; state the real basis | zero occurrences of the claim (grep) |
| G6.3 | Make all three flagship projects externally verifiable | each has a reachable artifact |
| G6.4 | Remove dead code paths that imitate working features | grep proves absence |
| G6.5 | Repair the drift in P5 | each row checked |

### 3.2 Inherited from v5 (unchanged)

Quoted from v5 §3, where they are labelled `Goal 13` … `Goal 16`. v6 renames nothing; the `G6.x` IDs in
§3.1 are v6's own additions.

| v5 label | Goal | Target | Window |
|---|---|---|---|
| Goal 13 | **Доверие системы (P0)** — every verification path leads to a public, non-empty, working artifact; zero flags F1–F7 | 0 empty repos in the profile; 100% of cards → non-empty repo; `make check` green. Private repos allowed if not in a featured position | end of v5 Phase 11 |
| Goal 14 | **Контакты рекрутеров/мес (north star)** — contact initiations from recruiters/hiring managers | ≥2/mo at Checkpoint 9; **≥4/mo by 90 days** | 90 days |
| Goal 15 | **Охват/дистрибуция** — unique visitors/90d and share from managed channels | ≥100 uniq./90d; ≥30% of traffic non-GitHub; ≥1 visit from hh.ru | 90 days |
| Goal 16 | **Глубина проверки** — a visitor who reaches a project page opens the repo/demo | ≥30% of project-page visitors click through | 90 days |

**Read Goal 13 carefully when executing.** Its target includes "0 empty repos in the profile", which is
work in the sibling repositories, not in this one — see §5.1.

### 3.3 Non-goals — explicitly out of scope

- **Visual redesign.** Type, palette, themes, layout are already ahead of the field. Do not restyle.
- **New frameworks, new UI libraries, new themes.** Three themes is already one more than needed.
- **SEO / AEO build-out.** `llms.txt`, AI-crawler robots, JSON-LD, OG generation, sitemap, RSS all
  ship. This PRD's only SEO obligation is to *not break them*.
- **Distribution and reach campaigns.** Owned by v5 Phase 12.
- **Opening the private repositories.** Decided against; see D9.
- **Buying a custom domain.** Decided against; see D6.
- **Real employment experience.** This is the correct fix for P2 and it is a 90-day goal owned by v5
  Phase 12, not a three-week task. This PRD makes the site honest in the meantime.

---

## 4. Decisions taken (2026-09-17)

| # | Decision | Rationale |
|---|---|---|
| D1 | Primary audience: hiring for DA / BI / Product Analyst (middle+). Secondary: peer/community | Money and deadline live in hiring; everything else is subordinate |
| D2 | This PRD is about **consolidation and credibility**, not redesign | §1.2 — the visual layer is already done |
| D3 | PRD language English, agent-executable format, file `docs/prd-v6.md` | Consistent with the repo's `docs/prd-vN.md` convention; a sixth document in a third location would be unreadable |
| D4 | Positioning line: `Product Analyst // A/B Testing & Retention` | The current pitch ("Гипотеза → эксперимент → метрика → рост") describes every analyst's process and excludes nobody |
| D5 | EN is the base and carries depth; RU is a switcher at working-minimum depth | EN serves the international market, RU serves current RF interviews. Two full versions would leave both thin |
| D6 | Keep `github.io`; do **not** buy a domain — but **rename the repo** to `NikitaBoyarkin.github.io` | Renaming gives the root URL `https://nikitaboyarkin.github.io/` for free and removes `base:` entirely. A project-site path reads as "coursework", not "my work" |
| D7 | Adopt Meidinger's *principle* (`one idea per screen`), not his file-system framing | The tilde/folder metaphor confirms his identity as a developer-founder; on an analyst's site it reads as costume. Two elements are worth keeping: `~/projects` as a section heading, and `git log` as the CV link |
| D8 | Three deep case studies + a compressed list of the rest | There is no single product to anchor on, so three *different* proofs are needed: full-stack engineering, experimentation, product metrics |
| D9 | **Do not open any private repository.** Compensate with non-code artifacts | Sanitising three repos is weeks of work and re-introduces leak risk. Three different artifact types prove three different things |
| D10 | About-cluster → **two** pages: `/about` + `/value` | Split by job, not by topic: "who you are" vs "what you deliver". One long page would not be read at a 36-second median |
| D11 | `/now` merges into `/about`; `/start` deleted; `notes`+`guides` become one parameterised route; `/topics` stays | Verified duplication and one-inbound-link make the first three cheap cuts. `/topics` is the only structural view of coverage by proficiency level and cannot be derived elsewhere |
| D12 | Delete `AudienceBar` and its reorder helper | Code that imitates a feature is worse than no code; recoverable from git in minutes if traffic ever justifies it |
| D13 | Remove the testimonials block; do not leave it empty | Decided against collecting recommendations for this cycle rather than leaving a component that renders nothing |
| D14 | Metrics: inherit G13–G16, add **proof-reach rate** | G16 counts clicks into private repos as proof. The new metric counts only *reachable* evidence |
| D15 | Horizon: 3 weeks / 3 sprints, with a 90-day goal outside this PRD | Two weeks fixes the diagnosis but not the credibility gaps; six weeks dissolves into v5's territory |
| D16 | Contact stays Telegram-only; **do not add email** | The single-contact decision in `CONTEXT.md` is deliberate and gives a clean, measurable funnel — which is what G14 needs. Raised as a counter-argument during planning and withdrawn once the existing rationale was read |
| D17 | Synthetic data labelled honestly, not hidden | An analyst is hired for honesty about data. "I generated a dataset with known ground truth in order to validate the method" is a strength; being caught hiding it is terminal |
| D18 | Blog: translate 4–6 strongest posts into EN; do not translate all 24 | EN traffic is currently ≈0; 24 translations are weeks of work for no audience. 4–6 removes the "abandoned site" impression |
| D19 | Hero gains a PhD bridging line, but PhD is **not** the headline | Uncontextualised, a labour-psychology PhD reads as "wrong field". Adjacent to proof, it is a differentiator no other DA candidate has |

---

## 5. Work plan

### S1.0 — Capture baseline (MUST RUN FIRST)

Record, with dates and sources, into `docs/prd-v6-baseline.md`:

| Metric | Definition | Source |
|---|---|---|
| B1 | Recruiter contacts / month | manual count: Telegram DMs + LinkedIn |
| B2 | Unique visitors / 90d | PostHog unique persons, all locales |
| B3 | Repo-click rate | PostHog: sessions firing any `github_*` event ÷ sessions on `/projects/*` |
| B4 | **Proof-reach rate** (new) | sessions firing any of {repo click, demo click, `case_study_read`} ÷ sessions on `/projects/*` |
| B5 | Personal-layer route count and nav item count | `ls src/pages`, `Base.astro` nav block |

**Acceptance:** `docs/prd-v6-baseline.md` exists, contains all five numbers, each with the query or file
used to obtain it. `case_study_read` does not exist yet `[V]`, so B4's baseline is recorded as
`not measurable yet — instrumentation task S3.2`.

---

### Sprint 1 — Consolidate

#### S1.1 — Rename the repository to `NikitaBoyarkin.github.io`

Files: `astro.config.mjs`, `.github/workflows/deploy.yml`, `.github/workflows/sync-github.yml`,
`src/content/projects/site.md`, `README.md`, any `withBase()` call whose argument encoded the subpath.

Steps: rename on GitHub → remove `base` from `astro.config.mjs` → confirm `site` stays
`https://nikitaboyarkin.github.io` → rebuild.

**Acceptance:**
- `grep -rn "Personal_Projects.github.io" dist/` returns **no** URLs (repo-name references in prose
  are allowed; URL paths are not)
- `bun run build && bun run check` green
- Lighthouse CI job passes
- `https://nikitaboyarkin.github.io/` serves the home page

**Risk R1** — old `…/Personal_Projects.github.io/…` URLs stop resolving. Mitigation: traffic is 54
visits/90d and referrers point at the repo, not at deep paths. GitHub redirects the renamed repo.

#### S1.2 — Consolidate the about-cluster into `/about` + `/value`

Target structure for `/about`:
1. Who I am (from `whois`)
2. How I work (from `whois` + `work-with-me`)
3. Now (from `now` — dated, plus the reading line)
4. How to work with me (from `work-with-me`)
5. Location / format (from `whois`)

`/value` keeps and absorbs: the metrics grid, Hiring / Collaboration offer formats, proof links.

Delete: `src/pages/whois.astro`, `src/pages/work-with-me.astro`, `src/pages/now.astro`, and their EN
mirrors `src/pages/en/whois.astro`, `src/pages/en/work-with-me.astro`.

**Deep links must survive.** Add redirects in `astro.config.mjs` `redirects` for `/whois/`,
`/work-with-me/`, `/now/` and their `/en/` counterparts to the corresponding `/about/#anchor`.

**De-duplicate.** The identity sentence and the reproducibility sentence currently appear in
paraphrase on three pages `[V]`. State each **once**, on `/about`.

**Preserve analytics.** `whois_cta`, `work_with_me_cta`, `value_cta`, `value_github` are wired events
`[V]`. Do not silently drop them — either keep the event names on the merged CTAs or record the rename
in `docs/cta-inventory.md`. A dropped event breaks the G14 funnel retroactively.

**Acceptance:**
- Every unique fact from the audit's per-page inventory renders on `/about` or `/value`
- No sentence appears twice anywhere in the rendered site (spot-check the identity and
  reproducibility sentences — each exactly once)
- `curl -I` against `/whois/`, `/work-with-me/`, `/now/` returns a redirect, not a 404
- `bun run build && bun test && make check` green
- The nav renders ≤5 items (see S1.6)

#### S1.3 — Merge `notes` + `guides` into one parameterised route

`notes.astro` and `guides.astro` are template twins differing only by `category` filter `[V]`.

**Acceptance:** one route file serves both filtered views; `/guides/` redirects; `BlogCard` rendering
unchanged; post counts per filter unchanged.

#### S1.4 — Delete `start.astro`

45 words, no analytics, one inbound link at `src/pages/contact.astro:23` `[V]`. Its routing value
becomes an in-page jump nav at the top of `/about`.

**Acceptance:** `start.astro` and `en/start.astro` removed; `grep -rn "start/" src/` finds no dead
links; `scripts/check_site.py` green.

#### S1.5 — Remove dead code: `AudienceBar` and the testimonials block

Delete:
- `src/components/AudienceBar.astro`
- the `window.__reorderHomeStack` block at `src/layouts/Base.astro:349–366`
- the `.home-stack` / `data-order-*` CSS override at `src/styles/global.css:280`
- `src/components/Testimonials.astro` and its data module

**Acceptance:** `grep -rn "AudienceBar\|__reorderHomeStack\|data-order-\|Testimonials" src/` returns
nothing; build green.

**Note for the executing agent:** if any deleted symbol turns out to be referenced after all, stop and
report — do not delete a live code path to satisfy this grep.

#### S1.6 — Retarget the navigation

Current `[V]`: Проекты / Обо мне / Кто я / Ценность / Формат / Заметки / Контакты.

Target: **≤5 items** — Проекты / Обо мне / Ценность / Заметки / Контакты. Apply the same to the EN
nav. Keep the Meidinger principle: one idea per screen, no menu item that leads to a page which is a
paraphrase of another.

**Acceptance:** nav arrays in `src/layouts/Base.astro` (and the EN branch) contain ≤5 entries; every
entry resolves; no nav item points to a redirect.

#### S1.7 — Remove unbacked experience claims

Remove every "4+ года" / "4+ years" claim. Replace with an explicit, honest basis, e.g.
*"Portfolio of reproducible analytics projects — experimentation, retention, segmentation — with full
methodology and code. Built from project work, not from employment."*

**TWINS sweep is mandatory.** Run before claiming completion:

```
grep -rn "4+ год\|4+ year\|4 года\|4 years\|четыр" src/ scripts/ cv/ public/ README.md
```

Record the number of sites found and the files, in the completion note.

Likely sites `[I]`: `src/pages/about.astro`, `src/pages/whois.astro` (until S1.2), `src/pages/value.astro`,
`src/pages/cv.astro`, the rendercv YAML source outside this repo, `src/lib/metrics.ts`.

**Acceptance:** the sweep returns zero occurrences of an unbacked duration claim; the honest framing
appears on `/about`, `/value`, and the CV; the regenerated `public/CV-Nikita-Boyarkin.pdf` matches.

#### S1.8 — Repair the drift in P5

| Fix | File |
|---|---|
| `sqlCases: 10` → match the project text, or correct the text to match | `src/lib/metrics.ts` |
| "Astro v5" → "Astro 7" | `README.md`, `src/content/projects/site.md` |
| `button-bg` documented value vs shipped `#1400c3` | `DESIGN.md` |
| Untrack and ignore the build cache | `.gitignore`, `src/graphify-out/cache/**` |
| Decide `dist/`: untrack (Actions rebuilds it) or keep | `.gitignore` |
| CLS 0.182 on `/projects/cohort/` → investigate and fix | the cohort project template / its chart component |
| Reconcile the project count (15 vs 16) in whichever direction is true | `docs/prd-v5.md` §2.1 or `src/lib/projects.ts` |

**Acceptance:** `grep -rn "Astro v5" .` (excluding `node_modules`, `dist`) returns nothing;
`git ls-files src/graphify-out | wc -l` is 0; `bun test` covers the `metrics.ts` value so the drift
cannot silently return.

#### S1.9 — Mark v4 and v5 superseded

Add a two-line header note to `docs/prd-v4.md` and `docs/prd-v5.md` pointing at this document, so no
future agent starts executing a superseded plan.

**Done 2026-09-17** — both files now carry a `⚠️ SUPERSEDED <date> — исполнять по docs/prd-v6.md`
status line plus a note naming exactly what v6 inherits.

#### S1.10 — Fix the bot card `[v5 flag F3]`

`src/content/projects/bot.md:17` links the stub `telegram_bot_public`. Point the card at the real public
repository (`telegram_bot`), or, if that one is private, mark it private and link a compensating artifact
per D9.

**Acceptance:** no project card in either locale links a repository that contains no code; the RU and EN
bot cards agree; `grep -rn "telegram_bot_public" src/` returns nothing, or returns only a deliberate
mention of the stub with a stated reason.

**Note for the executing agent:** this requires knowing which of the two repositories is public. If both
are private this becomes a D9 compensation task, not a link swap — report rather than guessing.

#### S1.11 — Re-curate the ML slot of the lineup `[v5 flag F7]`

F7: the site features `ml` (a Machine Learning A-Z course exercise) while the stronger `churn-prediction`
and `causal-uplift` are absent. Replace or demote `ml` and surface the stronger ML work, so the ML signal
is carried by the strongest artifact rather than the most course-like one.

**Acceptance:** the ML position in the lineup is occupied by work demonstrating leakage-free ML or causal
inference, not a course completion; RU and EN agree; `PROJECT_ORDER` updated if the set changes.

---

### 5.1 Repo-side flags inherited from v5 — outside this repository

v5 is now superseded, so its Phase 11 repo-hygiene items would otherwise be dropped. They are **not**
dropped — they are recorded here, because v6 is the executing document. They live in the sibling
repositories under `/Users/nikitaboarkin/Desktop/00 ide/00 portfolio/`, not in the site repo, so they are
not Sprint 1 site tasks.

| Flag | Work | Severity | Note |
|---|---|---|---|
| F4 | 3 empty/stub repos in the profile: `propensity` (empty dir), `telegram_bot_public` (stub), `funnel` (one-cell ipynb) | MEDIUM | Goal 13's "0 empty repos" target lands here. Archive or delete — **destructive, needs AUTH** |
| F5 | Cyrillic `а` in `аctivation-funnel` breaks URLs and git links; no README | MEDIUM | Renaming a published repo is outward-facing — **needs AUTH** |
| F6 | `airflow`: live code and PRD, empty README (0 bytes) | MEDIUM | Cheapest item in the table — an ETL skill is invisible for want of a README |

F3 (bot card → stub) is a site fix and lives in Sprint 1 as S1.10. F7 is a site fix and lives there as
S1.11.

**PENDING: F4 and F5 require AUTH** — repo archival/deletion and a public rename. Marking v5 superseded
does not transfer authorisation for them. F6 needs none and can be done whenever the sibling repositories
are next open.

---

### Sprint 2 — Prove

#### S2.1 — `posthog-saas-analytics` → public dashboard `[D9]`

Publish a live shared view of the analysis (PostHog share link, or a hosted Streamlit/Looker view on
the same generated data) showing funnel, cohort retention, A/B, and revenue/LTV. A live dashboard is
stronger proof than a repo nobody will clone.

**Acceptance:** the project card links to a URL that opens without authentication; the link is present
in both RU and EN frontmatter.

#### S2.2 — `streamlit-app` → 2–3 minute screen recording `[D9]`

Show the dashboard being used: AARRR funnel, cohort retention, revenue, segmentation.

**Acceptance:** video reachable from the project card; linked in both locales.

#### S2.3 — `supabase-product-analytics` → public dataset + schema + RLS extract `[D9]`

The artifact that cannot be shown in a video, and the strongest signal for an analyst: the data is
downloadable, the schema is readable, and the RLS policies are quoted in the case study. Also the best
candidate for satisfying D17 — this is the case where "real data" can be stated honestly.

**Acceptance:** dataset downloadable; schema documented in the case study; RLS policies quoted;
card links all three in both locales.

#### S2.4 — Mark verifiability on the three cards

Replace the bare "Смотреть на GitHub" link with an explicit marker, e.g. `private — verifiable on
request` plus the artifact link. Never let a card send a visitor into a private-repo notice.

**Acceptance:** clicking any link on any project card either opens real proof or states clearly that
the repository is private and links the compensating artifact.

#### S2.5 — Reposition the hero `[D4, D19]`

Replace h1 "Продуктовый аналитик" + pitch "Гипотеза → эксперимент → метрика → рост" with:

- role h1, and beneath it the specialism — `A/B Testing & Retention`
- one bridging line placing the PhD adjacent to the proof (not as the headline)

**Acceptance:** the hero states a specialism; the PhD line appears once in the hero; the current
process-pitch string is gone.

#### S2.6 — Three case studies + compressed list `[D8]`

Surface three projects as the headline proof, each demonstrating a distinct skill, and compress the
remaining thirteen into a scannable list below. Candidate set `[I]`:

| Project | Skill proven | Note |
|---|---|---|
| `supabase` | full-stack data engineering (Postgres, RLS, Edge Function) | needs S2.3 first |
| `volta` | experimentation + funnel + retention | already the strongest public case |
| `posthog` | product metrics pipeline | needs S2.1 first |

Confirm the final three **after** S2.1–S2.3 land, since an unverifiable project cannot headline.

**Acceptance:** home page renders three deep case-study cards plus a compressed list of the rest; each
headline project has at least one reachable artifact.

#### S2.7 — Public PostHog dashboard for the portfolio's own funnel

The strongest available differentiator: the portfolio analyses itself, publicly. Uses the events
already wired `[V]`.

**Acceptance:** a public PostHog dashboard URL exists and is linked from `/about` or the site's own
case study.

---

### Sprint 3 — Extend

#### S3.1 — Translate 4–6 posts into EN `[D18]`

`ab-calibration-simulation` and `cohort-triangles-retention` already exist `[V]`, so A/B and retention
are covered in EN. Choose the remaining posts for what EN lacks, not by recency.

**Acceptance:** EN `writing` index lists 6–8 posts; no EN index shows a count that makes the RU/EN gap
visible; each translated post renders with correct OG image and JSON-LD.

**PENDING:** final post selection requires the owner's input.

#### S3.2 — Instrument the proof-reach metric `[D14]`

Add a `case_study_read` event firing at 75% scroll depth on `/projects/*` and `/en/projects/*`. Then
B4 becomes computable.

**Acceptance:** the event fires in PostHog on a real visit; `docs/prd-v6-baseline.md` B4 is updated
from "not measurable yet" to a real number.

#### S3.3 — Writing surface on the home page

Surface recent writing (LinkedIn feed, or a curated artifact list) so the site does not read as
static. Fallback if no feed is practical: a list of 3–5 slide decks or write-ups.

**Acceptance:** home page shows recent writing with dates; links resolve.

---

## 6. Acceptance metrics

Baseline is captured in S1.0, **before** any change.

| Metric | Baseline | Target | Window |
|---|---|---|---|
| G14 — recruiter contacts/month (north star) | B1 | **≥4/month** | 90 days |
| G15 — unique visitors | B2 (54) | ≥100 | 90 days |
| G16 — project-page → repo clicks | B3 | ≥30% | 90 days |
| **Proof-reach rate** (new) | B4 | ≥40% of project-page sessions reach *reachable* proof | 30 days after S3.2 |
| G6.1 — personal-layer routes | 7 | **3** | Sprint 1 |
| G6.1 — nav items | 7 | **≤5** | Sprint 1 |
| G6.2 — unbacked duration claims | ≥5 sites `[I]` | **0** | Sprint 1 |
| G6.4 — dead-code symbols | 3 (`AudienceBar`, `__reorderHomeStack`, `Testimonials`) | **0** | Sprint 1 |

**Interpretation rule:** G14's baseline sample is under 100 and the current conversion rate is
therefore noise. Evaluate G14 on absolute contact count, never on a percentage derived from it.

---

## 7. Risks

| ID | Risk | Mitigation |
|---|---|---|
| R1 | Repo rename breaks inbound links and changes the Pages URL | Low traffic (54/90d); GitHub redirects the renamed repo; verify post-deploy |
| R2 | Consolidation loses a shared deep link | Redirects in `astro.config.mjs`; verify each with `curl -I` |
| R3 | Dropping "4+ года" weakens ATS keyword matching | Replace with a skill-dense honest framing rather than deleting the line |
| R4 | Private-repo compensation reads as evasion | Label the privacy explicitly and link a real artifact; never route a visitor to a private-repo notice |
| R5 | Deleting `AudienceBar` loses future personalisation | Recoverable from git; the mechanism did not work, so nothing is lost now |
| R6 | Deleting a symbol that turns out to be live | S1.5 instructs the agent to stop and report rather than satisfy the grep |
| R7 | EN translation effort expands | Hard cap at 6 posts; the cap is the decision (D18) |
| R8 | This PRD itself becomes a sixth stale document | S1.9 marks v4/v5 superseded; S1.0 and S3.2 update a shared baseline file |
| R9 | Superseding v5 silently drops its repo-side Phase 11 hygiene work (F4–F6) | §5.1 carries it, with the AUTH-gated items marked PENDING |
| R10 | S1.10 assumes `telegram_bot` is public; if both bot repos are private the fix is a D9 artifact, not a link swap | S1.10 instructs the agent to report rather than guess |
| R11 | Consolidation removes a page whose only inbound link came from another deleted page | S1.2's redirect table plus `scripts/check_site.py`; S1.4 names the `contact.astro:23` case explicitly |

---

## 8. PENDING — needs the owner

| Item | Why it waits |
|---|---|
| Selection of the 4–6 posts to translate (S3.1) | Requires the owner's judgement on which arguments are strongest |
| Confirmation of the final three headline projects (S2.6) | Depends on which artifacts land in S2.1–S2.3 |
| Real employment experience (the true fix for P2) | 90-day goal, owned by v5 Phase 12, and it requires action outside this repository |
| A live Streamlit/PostHog share URL for S2.1 and S2.7 | Requires an account action and a decision about which data is safe to expose |
| **AUTH** for F4 (archive/delete 3 empty repos) and F5 (rename `аctivation-funnel`) | Irreversible and outward-facing — §5.1 |
| Which bot repository is public (S1.10) | Decides whether the fix is a link swap or a D9 compensating artifact |
| Confirmation that the `dist/` and `graphify-out/cache` repos files may be untracked (S1.8) | `git rm --cached` rewrites what everyone else sees; it is reversible but outward-facing |

---

## 9. Appendix — verified facts this document relies on

Every claim in §1–§2 marked `[V]` comes from a direct read of the repository on 2026-09-17. Key paths:

- Routes: `src/pages/*.astro`, `src/pages/en/*.astro`
- Projects: `src/content/projects/*.md` (16), `src/content/projects-en/*.md` (16)
- Posts: `src/content/posts/*.md` (24 RU), `src/content/posts-en/*.md` (2 EN)
- Order: `src/lib/projects.ts` → `PROJECT_ORDER`
- Metrics: `src/lib/metrics.ts`
- Graph: `src/lib/graph.ts`, `src/lib/graph-data.ts`, `src/lib/graph-layout.ts`,
  `src/components/KnowledgeGraph.astro`, `src/components/ProjectGraph.astro`
- Analytics: `src/components/Analytics.astro`, `src/components/BeaconMetrics.astro`
- SEO/AEO: `src/pages/robots.txt.ts`, `src/lib/llms-txt.ts`, `src/pages/sitemap` via `@astrojs/sitemap`
- Design tokens: `src/styles/global.css`, `DESIGN.md`, `docs/prd-palette-60-30-10.md`
- Build/deploy: `astro.config.mjs`, `.github/workflows/deploy.yml`, `.github/workflows/sync-github.yml`
- Prior art: `docs/prd.md` … `docs/prd-v5.md`, `CONTEXT.md`, `CLAUDE.md`, `TESTIMONIALS.md`

### Drift this appendix exists to catch

`dist/` and `src/graphify-out/cache/**` are committed `[V]`. `DESIGN.md` disagrees with shipped CSS
`[V]`. `metrics.ts` disagrees with the SQL project text `[V]`. Fixing these is S1.8 — but the reason
they existed at all is that nothing failed when they drifted. Where a check is cheap (S1.8's metrics
test), add the check, not just the fix.
