# PRD v7 — Sprint 1 toolkit (outreach + probes)

| Field | Value |
|---|---|
| Created | 2026-09-19 |
| Source PRD | `docs/prd-v7.md` §5 V1.1 / V1.3 |
| Owner | Nikita Boyarkin |
| Status | Ready to send — owner-gated (needs named targets) |

Operational templates for Sprint 1. **Not findings** — results are logged in
`docs/prd-v7-findings.md`. This file exists so the owner can start sending in minutes, not so
v7 grows a second record. Nothing here is sent automatically.

Two rules carried from the PRD apply to everything on this page:

- **V6 — decision probes, not opinions.** Ask about past behaviour and screening criteria, never
  about preferences.
- **R7.5 — no volume campaigns.** This is research and a handful of probes, not "marketing the
  person". No mass sending.

---

## 1. Who to contact

Target segments (PRD v7 §1.1 ranking, V4): **segment 1** (product teams with an experimentation
culture) and **segment 2** (retention/growth teams in subscription and fintech products).

| Role to ask | Why |
|---|---|
| Hiring manager / team lead of a product or growth analytics team | Owns the screening criteria — the actual object of V1.1 |
| Senior/middle product analyst who sat on the hiring loop | Saw what the offer-holder presented |
| In-house recruiter / tech recruiter for data roles | Owns the top-of-funnel filter |

Aim for a spread: at least 3 hiring managers and at least 2 recruiters across the 10.

---

## 2. V1.1 — decision-interview outreach

The ask is a **15-minute research conversation about their screening criteria** — explicitly not
a job ask, not a CV review. Reciprocity: share the synthesised findings with every participant.

### RU (LinkedIn / Telegram / hh)

> Привет, [Имя]. Я перехожу в продуктовую аналитику после PhD по психологии труда и сейчас
> изучаю, как нанимающие отбирают middle+ аналитиков с опытом A/B и retention. Нужен разговор
> на 15 минут — не про вакансию и не про моё резюме, а про ваши критерии отбора: что заставляет
> вас остановиться на кандидате и что отсекает. Со всеми участниками поделюсь итогами
> исследования. Удобно на этой неделе?

### EN (remote-first / EN employers)

> Hi [Name] — I'm moving into product analytics after a PhD in work psychology, and I'm studying
> how hiring teams screen mid-level analysts with A/B and retention experience. I'd like 15
> minutes — not about a role or my CV, but about your screening criteria: what makes you stop on
> a candidate, and what rules one out. I'll share the research findings with everyone who takes
> part. Free this week?

### The interview itself

Use the 5 questions fixed in `docs/prd-v7.md` §5 V1.1 verbatim. Record each interview as one
section in `docs/prd-v7-findings.md` with:

```
### V1.1 — Interview N — [role, segment, date]
Q1 … Q5 answers (verbatim where possible)
Concrete bar named for Q3 (the "no commercial tenure" question): yes/no + what they said
```

**Acceptance:** 10 sets of notes; ≥7 name a concrete bar in Q3; one synthesised paragraph
answering "is commercial tenure a hard filter?" with the count behind it.

---

## 3. V1.3 — message probes (5)

A probe is one short message: the positioning line + **one** proof link. Cheaper read on risk #4
(is the A/B & Retention specialism scarce?) than the A/B test, and it runs in parallel.

**Positioning line (v6 D4 / S2.5):** `Продуктовый аналитик · A/B-тесты и retention` /
`Product Analyst · A/B testing & retention`. Do not claim tenure — the honest career-change
framing stands (v6 S1.7); no "4+ years".

### RU

> Привет, [Имя]. Я продуктовый аналитик с фокусом на A/B-тесты и retention, PhD по психологии
> труда. Один кейс, который показывает, как я работаю: [proof-link]. Если у вас есть или
> откроется роль аналитика уровня junior+ / middle — буду рад обсудить.

### EN

> Hi [Name] — I'm a product analyst focused on A/B testing and retention, with a PhD in work
> psychology. One case that shows how I work: [proof-link]. If you have or expect a junior+ /
> mid-level analyst opening, I'd be glad to talk.

### Proof link — pick one, keep it public

Only public artefacts (v6 D9 stands; private repos are not opened). Current public candidates:
`volta-banking` (featured), or the public project page for it. **Do not** use a private repo.

### Log each probe

Append a row to `docs/contact-log.md` at stage `contact` (source = the channel). Any reply that
qualifies moves forward in the log. Record reply rate in `docs/prd-v7-findings.md` under V1.3.

**Acceptance:** 5 probes logged; reply rate recorded; qualifiers moved to the staged log.

---

## 4. Order of operations

1. Name the 10 interview targets → send the §2 message (V1.1). This is the gating item.
2. In parallel, send the 5 probes (§3, V1.3) — they need no scheduling.
3. Log every reply in `docs/contact-log.md` the day it arrives.
4. Feed results into `docs/prd-v7-findings.md`; do not start V2.x until V1.2's gate is decided.

## 5. What still needs the owner

| Item | Blocker |
|---|---|
| The 10 interview targets | Must be real named people in segments 1–2 (PRD §8) |
| Permission to spend 20 applications on junior+ roles | A deliberate step down — owner's call (PRD §8) |
| Choice of proof link for the probes | Public artefact selection |
