# PRD — Writing ("Статьи") Section: Filter Fix + Hardening

| Field | Value |
|---|---|
| Status | Phases 0–1 executed 2026-09-18 (filter fix + card-badge fix, both guarded). Phases 2–3 open. |
| Date | 2026-09-18 |
| Owner | Nikita Boyarkin |
| Scope | `/writing/` + `/en/writing/` filter UI (`BlogFilter.astro`, `BlogCard.astro`, `styles/blog.css`). No redesign, no content rewrite. |
| Relates to | `docs/prd-v6.md` (consolidation), `docs/prd-readability.md` (content). Does not supersede either. |
| Trigger | Reported defect: "clicking a topic chip under «Темы:» does not filter the Статьи list." |

---

## 0. How to read this document

1. **Evidence classes are marked.** `[V]` verified by direct read/browser test · `[I]` inferred · `[NV]` not verified.
2. **Every task carries an acceptance criterion that fails when the task is not done.**
3. **Verified behavior is frozen.** The category filter, tag filter, hash round-trip and pagination-crossing filter all work; the fix must not regress them.

---

## 1. Context

### 1.1 The "Статьи" section as-built `[V]`

Route `/writing/` (RU, `src/pages/writing/[...page].astro`), paginated 10/page (`PER_PAGE`, `src/lib/posts.ts:9`). 24 RU posts → 3 pages; 2 EN posts → 1 page (`/en/writing/`).

`BlogFilter.astro` renders two surfaces above the card grid:

| Surface | Markup | Status |
|---|---|---|
| Category row | `.filter-tag[data-filter]` — Все / Журнал решений / Фреймворки / Гайды / Заметки | `[V]` filters correctly |
| Topic ("Темы:") row | `.filter-tag.tag-chip[data-tag]` — 16 recurring chips + 31 single-use behind "Все теги" | `[V]` filter *logic* correct; was **visually broken** |

Client-side filtering runs over the full post list embedded as JSON (`#writing-posts-data`, `writing/[...page].astro:113`). Results render into `#blog-filter-results`, inserted after `#blog-list` (`BlogFilter.astro:175–189`). URL hash syncs and is restored on load (`BlogFilter.astro:285–299`).

### 1.2 The defect `[V]`

Clicking a topic chip did update the DOM (container created, correct cards, correct status text) but **nothing changed visually** — the click looked dead. Reproduced in real Chromium (Playwright) against `dist/` and the live site.

### 1.3 Root cause `[V]`

`BlogFilter` hides the static list and pagination by setting the `hidden` property:

- `BlogFilter.astro:172` — `if (listEl) listEl.hidden = isFiltered;`
- `BlogFilter.astro:173` — `if (paginationEl) paginationEl.hidden = isFiltered;`

The `hidden` attribute is implemented by the UA stylesheet as `[hidden] { display: none }`. But `src/styles/blog.css` sets an author `display` on both targets — `.blog-list { display: grid }` (`blog.css:47`) and `.pagination { display: flex }` (`blog.css:527`). **Author styles always beat the UA stylesheet**, so the elements were never actually hidden:

| Element after a chip click | `hidden` property | computed `display` | height |
|---|---|---|---|
| `#blog-list` | `true` | **`grid`** | 2133 px (10 cards) |
| `.pagination` | `true` | **`flex`** | — |

Consequence: the still-visible static list pushed the filtered results to `top ≈ 2261 px` — far below the 900 px viewport — so the user saw no change.

The repo already knows this pattern: `KnowledgeGraph.astro:1316–1317` re-hides `.kg-edge-panel` with an explicit `.kg-edge-panel[hidden] { display: none }`.

### 1.4 Adjacent gaps found `[V]`

| # | Gap |
|---|---|
| G1 | No analytics on any filter interaction — filter usage is unmeasurable. Only `random_post_click` (`BlogFilter.astro:245`) exists. |
| G2 | No empty state — a filter with zero matches renders an empty container with no message. |
| G3 | No visible "clear filter" affordance; Esc clears only when a card has focus (`BlogFilter.astro:261`). |
| G4 | `BlogFilter.astro` filter logic is untested; the CSS-cascade bug had no regression guard (this PRD adds one). |
| G5 | The card badge (`.blog-card-tag`, `BlogCard.astro`) was a `<span>` inside the card `<a>` — clicking it opened the post rather than filtering. Same pattern on the homepage strip (`MaterialStrip.astro:50`, unchanged). | **Fixed** on writing (Phase 1) |

---

## 2. Problem statement

The "Темы:" filter promised a narrowing of the list and delivered a silent no-op, because the CSS cascade defeated the `hidden` toggle the script relied on. The fix restores the intended behavior and adds a check that would have caught it.

---

## 3. Goals / Non-goals

**Goals**
- A topic/category click visibly narrows the list in place.
- The behavior is guarded against regression.
- The section's remaining rough edges (empty state, clear affordance, measurement) are specified.

**Non-goals**
- Redesign or taxonomy changes.
- Touching `src/content/**`.

---

## 4. Requirements

| ID | Requirement | Acceptance criterion | Prio | Status |
|---|---|---|---|---|
| RF-1 | `[hidden]` must actually hide the static list and pagination during filtering. | `.blog-list[hidden]` / `.pagination[hidden]` compute to `display: none`; first result renders above the fold. | P0 | **Done** |
| RF-2 | Regression check for RF-1. | `scripts/verify-writing-filter.mjs` fails on a pre-fix build, passes on the fixed one. | P0 | **Done** |
| RF-3 | Card theme badge filters the list instead of navigating. | Clicking `.blog-card-tag` on `/writing/` filters (`decision-log` → 7) and does not change the URL path; the badge is a `<button>`, not nested in an anchor. | P1 | **Done** |
| RF-4 | Clear-filter affordance beside the status line. | Keyboard-only activation returns to the unfiltered list. | P1 | Open |
| RF-5 | Empty state: `Ничего не найдено по «<filter>»` (EN equivalent). | Zero-match filter shows the message, not an empty container. | P1 | Open |
| RF-6 | Esc clears the filter from anywhere on the page. | Focus body → Esc clears. | P2 | Open |
| RF-7 | Filter analytics `writing_filter_used { kind, value, results }` + `writing_filter_cleared`, via the guarded `window.posthog`. | *manual* — event visible in PostHog after a real click. | P2 | Open |
| RF-8 | `astro check` + `bun test` + Lighthouse a11y gate stay green. | CI green. | P0 | Pending CI |

---

## 5. Phases

**Phase 0 — Fix + guard (RF-1, RF-2). EXECUTED 2026-09-18.**
- `src/styles/blog.css` — added `.blog-list[hidden], .pagination[hidden] { display: none }` with a comment pointing at `.kg-edge-panel[hidden]`.
- `scripts/verify-writing-filter.mjs` — Playwright check: chip present → static list hidden → pagination hidden → results non-empty → status text → first result above the fold → no page errors.
- Verified: fixed build `PASS` (first result `top=458px`); pre-fix build `FAIL` (static list visible, first result `top=2261px`).

**Phase 1 — Card badge (`RF-3`). EXECUTED 2026-09-18.**
- `BlogCard.astro` — card is now an `<article>`; the title is `<a class="blog-card-link blog-card-title">` whose `::after` stretches over the card (`styles/blog.css`), so navigation no longer requires wrapping the whole card in an anchor. New `filterableTag` prop renders the badge as a real `<button data-card-category>` on the writing index and keeps it a decorative `<span>` everywhere else (notes, topics, EN-parity handled).
- `BlogFilter.astro` — delegated click on `[data-card-category]` applies the category filter; the client-rendered `cardHtml` mirror updated to the new markup; keyboard nav now tracks `.blog-card-link`.
- Verified: badge is a `BUTTON` with no `<a>` ancestor; `elementFromPoint` across the card returns the stretched link (so the rest of the card still navigates); notes cards still navigate; ArrowDown nav still works; `bun run check` 0 errors, `bun test` 172 pass, `make check` OK.

**Phase 2 — Legibility & recovery (RF-4, RF-5, RF-6).**

**Phase 3 — Measurement (RF-7).**

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Card restructure (RF-3) breaks the whole-card link used on writing, notes and the homepage strip | Keep the badge out of the anchor; cover with the same verification script before/after. |
| Verification script needs a running server + browser | It is an opt-in script (`BASE_URL=… bun run scripts/verify-writing-filter.mjs`), not part of `make check`, so CI stays fast. |

---

## 7. Out of scope

Topic-page redesign (`/topics/*`), taxonomy cleanup, `SearchBox.astro`, content edits.
