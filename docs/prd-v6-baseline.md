# PRD v6 — Baseline (S1.0)

| Field | Value |
|---|---|
| Captured | 2026-09-18 |
| Window | 2026-06-20 → 2026-09-18 (90 days, end-exclusive of 2026-09-19) |
| Owner | Nikita Boyarkin |
| Source PRD | `docs/prd-v6.md` §5 S1.0 |
| PostHog project | "Default project" id 451732, org NBxHive, host us.posthog.com |
| Evidence classes | `[V]` verified by direct read/query · `[I]` inferred · `[NV]` not verified |

---

## Baseline metrics

| ID | Value | Definition | Source (exact query or file:line) | Date captured | Evidence |
|---|---|---|---|---|---|
| B1 | not measurable programmatically — needs owner | Recruiter contacts / month (Telegram DMs + LinkedIn) | Manual count by owner. Count, per calendar month, the number of *new* first-contact messages from recruiters/hiring managers arriving via (a) Telegram DMs to the owner's account and (b) LinkedIn InMail/connection-request-with-note. Exclude repeat messages in the same thread, peer/community messages, and outbound outreach. Record month-by-month counts for the 90-day window (Jun, Jul, Aug 2026) plus the current partial month. | 2026-09-18 | `[NV]` |
| B2 | 69 unique persons | Unique visitors / 90d — PostHog unique persons firing `$pageview`, all locales | PostHog `execute-sql`: `SELECT count(DISTINCT person_id) AS unique_persons_90d FROM events WHERE event = '$pageview' AND timestamp >= '2026-06-20' AND timestamp < '2026-09-19'` | 2026-09-18 | `[V]` |
| B3 | 6.4% (5 / 78) | Repo-click rate — sessions firing any `github_*` event ÷ sessions on `/projects/*` pages | Numerator — PostHog `execute-sql`: `SELECT count(DISTINCT properties['$session_id']) FROM events WHERE event IN ('project_github_volta','project_github_ab','project_github_bot','project_github_sql','project_github_streamlit','project_github_supabase','github_footer') AND timestamp >= '2026-06-20' AND timestamp < '2026-09-19'` → 5. Denominator — `SELECT count(DISTINCT properties['$session_id']) FROM events WHERE event = '$pageview' AND (properties['$pathname'] LIKE '/Personal_Projects.github.io/projects/%' OR properties['$pathname'] LIKE '/Personal_Projects.github.io/en/projects/%') AND timestamp >= '2026-06-20' AND timestamp < '2026-09-19'` → 78. Rate = 5/78 = 6.41%. The `github_*` events confirmed present in schema: `project_github_volta`, `project_github_ab`, `project_github_bot`, `project_github_sql`, `project_github_streamlit`, `project_github_supabase`, `github_footer`. | 2026-09-18 | `[V]` |
| B4 | pending — instrumentation shipped 2026-09-18 (S3.2); no post-deploy sessions yet | Proof-reach rate — sessions firing any of {repo click, demo click, `case_study_read`} ÷ sessions on `/projects/*` | `case_study_read` is now captured in `src/components/Analytics.astro` through `src/lib/scroll-depth.ts` (`reachedCaseStudyRead`, threshold 0.75, once per page load) on `/projects/<slug>/…` and `/en/projects/<slug>/…`, including Volta sub-parts and excluding the `/projects/` index. Numerator query: `SELECT count(DISTINCT properties['$session_id']) FROM events WHERE event = 'case_study_read' AND timestamp >= '<window start>'`. Denominator: same as B3. At the S1.0 capture on 2026-09-18 `case_study_read` was absent from the PostHog event schema (`read-data-schema` kind=events) and only repo-click events were measurable (5 sessions); the event name appears in the schema only after the S3.2 change is deployed, and the first real number follows the first post-deploy session. No `demo_click`-style event exists in the schema yet. | 2026-09-18 | `[V]` (instrumentation shipped; value `[NV]` until deploy) |
| B5 | Routes: 7 (RU), 6 (EN). Nav: 6 items in `<ul class="links">` + 1 separate CTA = 7 nav chrome entries. | Personal-layer route count and nav item count | Routes — `ls src/pages/*.astro`: personal-layer routes present are `whois.astro`, `value.astro`, `work-with-me.astro`, `about.astro`, `now.astro`, `start.astro`, `contact.astro` = 7. EN mirrors `src/pages/en/*.astro`: `about`, `contact`, `start`, `value`, `whois`, `work-with-me` = 6 (no `en/now.astro`). Nav — `src/layouts/Base.astro:193–200`, the `<ul class="links" id="nav-links">` renders 6 `<li>` entries: Projects (194), About (195), Whois (196), Value (197), Format/work-with-me (198), Notes (199). Contact is rendered separately as a CTA button at `src/layouts/Base.astro:209` (`<a class="button nav-cta" href={contactHref}>`), outside the `<ul class="links">`. Nav label dictionary at `src/layouts/Base.astro:61–67` defines 7 keys (navProjects, navNotes, navAbout, navWhois, navValue, navWorkWithMe, navContact). | 2026-09-18 | `[V]` |

---

## Notes

- **B2 vs v5:** v5 §2.3 recorded 54 unique visitors/90d; this baseline re-measured on 2026-09-18 over a different 90-day window and found 69. The window shifted, so the two are not directly comparable; the 69 figure is the current baseline.
- **B3 denominator path:** the site is still served under the `Personal_Projects.github.io` base path (repo rename S1.1 not yet applied), so `$pathname` values carry the `/Personal_Projects.github.io/` prefix; the query matches that prefix. After S1.1, the prefix disappears and the query must be updated.
- **B4 honestly:** the PRD's acceptance criterion for S1.0 explicitly states B4's baseline is recorded as `not measurable yet — instrumentation task S3.2`. This baseline records that, plus names the currently-measurable sub-signal (repo click).
- **S3.2 status (2026-09-18):** instrumentation shipped — `case_study_read` fires at 75% scroll depth on project pages (`src/components/Analytics.astro` + `src/lib/scroll-depth.ts`, unit-tested in `tests/lib/scroll-depth.test.ts`). It is **not yet a real number**: the value is `[NV]` until the change is deployed and a real session scrolls a project page. Update B4's value cell after the first post-deploy session.
- **B1 honestly:** no programmatic source exists for recruiter contacts. The owner must count manually; the exact counting rule is given above so the baseline and future G14 measurement stay comparable.
