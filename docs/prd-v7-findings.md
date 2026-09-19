# PRD v7 — Findings

| Field | Value |
|---|---|
| Created | 2026-09-19 |
| Source PRD | `docs/prd-v7.md` |
| Owner | Nikita Boyarkin |
| PostHog project | "Default project" id 451732, org NBxHive, host us.posthog.com |
| Evidence classes | `[V]` verified by direct read/query · `[I]` inferred · `[NV]` not verified |

This is the single growing findings file mandated by PRD v7 decision V7. Every validation
task (V0.2, V1.1–V1.4, V2.x, V3.2) appends its result here. Do not create parallel documents.

---

## V0.2 — Proof-reach baseline (2026-09-19)

**The headline number: `read_depth` at the 75% threshold has fired 0 times — proof-reach baseline is 0.** `[V]`

The instrument that v6 D14 promised and S3.2 built (`src/lib/scroll-depth.ts`,
`src/components/Analytics.astro:75–104`) is live and confirmed capturing — but only the
25% and 50% thresholds have ever been crossed, and by a single session. The 75% and 100%
thresholds — the ones that define "read the case study" — have never fired. `[V]`

### Exact query used

```sql
SELECT
  properties.content_type AS content_type,
  properties.depth        AS depth,
  count()                 AS events,
  uniq(properties.$session_id) AS sessions,
  min(timestamp)          AS first_seen,
  max(timestamp)          AS last_seen
FROM events
WHERE event = 'read_depth'
  AND timestamp >= '2026-09-01'
GROUP BY content_type, depth
ORDER BY content_type, depth
```

### Result `[V]`

| content_type | depth | events | sessions | first_seen | last_seen |
|---|---|---|---|---|---|
| case_study | 25 | 4 | 1 | 2026-09-19T01:05:59+03:00 | 2026-09-19T01:15:11+03:00 |
| case_study | 50 | 2 | 1 | 2026-09-19T01:08:54+03:00 | 2026-09-19T01:08:56+03:00 |
| case_study | **75** | **0** | **0** | — | — |
| case_study | **100** | **0** | **0** | — | — |

**Originating session:** `01a0b665-a58e-709d-8ce1-21791205f690`, RU, on `/projects/sql/`
(09-19 01:05–01:08) and `/projects/causal/` (09-19 01:15). This falls ~18 minutes after the
root-path deployment (first `/projects/…` pageview at `2026-09-19T00:47:49+03:00`), so it is
almost certainly a **controlled verification session, not an organic visitor**. Treat the
organic read_depth count as **0 sessions to date**. `[I]`

### Denominator (for the rate)

```sql
SELECT
  count(DISTINCT properties.$session_id) AS project_sessions_90d,
  count(DISTINCT person_id)              AS unique_persons_90d
FROM events
WHERE event = '$pageview'
  AND timestamp >= '2026-06-20' AND timestamp < '2026-09-19'
  AND properties.$pathname LIKE '%/projects/%'
  AND properties.$pathname  NOT LIKE '%/projects/'
```

**Result:** 64 project-page sessions, 21 unique persons over the 90-day window. `[V]`

> **Prefix caveat.** The 90-day denominator spans two URL regimes: the site moved from
> `/Personal_Projects.github.io/projects/…` to `/projects/…` on 2026-09-19 (first root-path
> pageview `00:47:49+03:00`). The query uses `LIKE '%/projects/%'` to match both. Read_depth
> only exists in the root-path regime (deployed 2026-09-18), so numerator and denominator are
> not yet on the same footing — this baseline is **directional, not a settled rate**. `[V]`

**Proof-reach rate (directional):** 0 / 64 = **0%**, against a v6 target of ≥40% of
project-page sessions (PRD v7 §6, G16). `[V]`

### v6 B4 value (carried forward)

`docs/prd-v6-baseline.md:21` recorded B4 as **"not measurable yet — instrumentation task
S3.2"**, with one controlled `case_study_read` verification capture on
`/projects/churn/` at `2026-09-18T11:42:20+03:00` (session `01a0b3ae-32d9-7cd0-9fed-645484c56e64`,
excluded as a verification session). That event name was later generalized to `read_depth`
(REQ-A09); the churn verification session does not appear in `read_depth` because it predates
the rename. `[V]`

### Traffic-gate context (why the rate is not a decision)

```sql
SELECT count(DISTINCT person_id) AS unique_persons_90d
FROM events
WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 90 DAY
```

**Result:** 72 unique persons / 199 sessions (rolling 90d). `[V]`

The site's own **Traffic gate** (`CONTEXT.md`) is ≥100 unique visits/90d. At 72, the site is
**below its own gate**, so the 0% proof-reach is a **track-only reading**: it is recorded, it is
not a basis for a decision, and no conversion percentage may be derived from it and quoted as a
rate (PRD v7 §6 interpretation rule). `[V]`

### Consequence for V2.x and V1.4

- The three credibility artifacts (V2.1–V2.3) are the intervention aimed at this metric. Their
  re-measurement happens after they ship; the 0% must not be attributed to them retroactively.
- V1.4 (positioning A/B) is **below the traffic gate today** (72 < 100). Per its own acceptance
  criterion, the mandated output is **"insufficient sample — not decided"**, not a decision. `[I]`

---

## V1.1 — Decision interviews (10) — PENDING

Not started. Requires the owner to name 10 real interview targets (PRD v7 §8). Script is
fixed in `docs/prd-v7.md` §5 V1.1 (5 decision questions). Append one section per interview +
the synthesised paragraph.

## V1.2 — Application experiment (20) — PENDING

Not started. Requires the owner's decision to spend 20 applications on middle−/junior+ roles
(PRD v7 §8). Log into `docs/contact-log.md`; compute the screening-invite rate; decide the
≥20% gate in writing here.

## V1.3 — Message probes (5) — PENDING

Not started.

## V1.4 — Positioning A/B — PENDING

Not started. Pre-read: traffic is at 72 unique persons/90d, below the 100 gate — expect
"insufficient sample — not decided" unless traffic rises first. `[I]`

## V2.1–V2.5 — Credibility artifacts (gated on V1.2) — PENDING

Carried from v6 S2.1–S2.4 and S2.7. Gated per PRD v7 decision V3.

## V3.1 — EN translations (4–6 posts) — PENDING

Carried from v6 S3.1.

## V3.2 — Managed distribution (4 weeks) — PENDING

Not started.
