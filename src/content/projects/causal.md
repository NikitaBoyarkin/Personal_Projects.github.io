---
title: Causal / Uplift — CUPED and Individual Treatment Effects
description: Causal inference for product experiments — CUPED variance reduction and T-/S-learner uplift on a synthetic randomized A/B test with a known heterogeneous effect, evaluated against ground truth with AUUC, Qini and per-segment recovery.
track: experiments
hero: images/causal.svg
impact:
  - CUPED keeps the ATE (0.270 → 0.276) and cuts the standard error ~26%
  - Same power with ~5.6k users/arm instead of 10k (95% CI narrows 1.35x)
  - Uplift models recover that new users respond ~10x more than returning users
  - Implemented from scratch on LightGBM — no causalml/econml dependency
tools:
  - Python
  - LightGBM
  - scikit-learn
  - pandas / NumPy
  - matplotlib
  - pytest
  - uv
github: https://github.com/NikitaBoyarkin/causal-uplift
updated: 2026-09-18
date: 2026-09-18
related:
  - /projects/ab/
  - /posts/churn-uplift-discount/
caseStudy:
  problem: "Стандартный двухвыборочный t-тест отвечает только на «работает ли эффект в среднем» и не использует пред-период. Из-за этого эксперименты требуют больше трафика, чем необходимо, а retention-акции рассылаются всем, тогда как реагирует лишь часть пользователей. Нужны методы, которые снижают дисперсию и оценивают эффект на уровне отдельного пользователя."
  approach: "CUPED: Y_adj = Y − θ·(X − mean(X)), где θ = Cov(Y,X)/Var(X) — та же ожидаемая оценка ATE при дисперсии ~(1 − ρ²). Два uplift-лернера на LightGBM: T-learner (модель на каждую руку) и S-learner (treatment как признак), подъём = P(t=1) − P(t=0). Оценка — AUUC, Qini, uplift@20%, ранговая корреляция с латентной τ и по-сегментное восстановление; всё реализовано с нуля на LightGBM, без causalml/econml."
  result: "CUPED не меняет точечную оценку (0.270 → 0.276, в пределах шума), но сжимает стандартную ошибку на ~26% и сужает 95% CI в 1.35× — эксперимент, которому нужно было 10k пользователей на руку, обходится ~5.6k. Оба лернера бьют random по всем метрикам; модель восстанавливает, что «новые» пользователи отвечают ~10× сильнее «возвращающихся», — это сигнал для таргетинга скидок."
  metrics:
    - label: "Снижение SE"
      value: "−26%"
    - label: "Сужение 95% CI"
      value: "1.35×"
    - label: "Пользователей на руку"
      value: "10k → 5.6k"
    - label: "corr(τ), S-learner"
      value: "0.66"
---

# Causal / Uplift — CUPED and Individual Treatment Effects

## Business Context

Causal inference для продуктовых экспериментов — два метода, которые идут дальше «t-теста по исходу»:

1. **CUPED** — снижение дисперсии с помощью ковариаты из пред-периода. Тот же ATE, но более узкий CI → эксперименту нужно меньше пользователей для той же мощности.
2. **Uplift-моделирование** — оценка индивидуального эффекта воздействия (ITE), чтобы retention- и скидочные акции таргетировать на тех, кто действительно реагирует, а не на всех.

Оба метода работают на синтетическом рандомизированном A/B-эксперименте с известным гетерогенным эффектом, поэтому оценки можно сверить с ground truth.

## Data & Method

Данные синтетические и детерминированные (seed = 42), 20 000 пользователей в рандомизированном эксперименте:

- `segment` — `new` (30%) / `returning` (70%) → гетерогенный эффект воздействия;
- `x_pre` — ковариата пред-периода, коррелированная с исходом (ρ ≈ 0.67);
- `treatment` — 50/50, независим от всего (чистая рандомизация);
- `tau_true` — истинный индивидуальный эффект (только для оценки);
- `y_cont` — непрерывный исход; `y_bin` — бинарная конверсия.

**CUPED** — та же оценка ATE, меньше дисперсия:

| Метод | ATE | SE | 95% CI |
|---|---|---|---|
| Naive | 0.270 | 0.019 | [0.232, 0.308] |
| CUPED | 0.276 | 0.014 | [0.247, 0.304] |

Точечная оценка не меняется (0.270 → 0.276, в пределах шума). Стандартная ошибка сжимается на ~26% (×0.74), CI сужается в 1.35×. Снижение дисперсии ~45% фактически против 55% теоретически (разрыв — ковариата является прокси пред-периода, а не самим исходом).

**Uplift** — индивидуальный эффект, T- и S-learner:

| Модель | AUUC | QINI | uplift@20% | corr(τ) |
|---|---|---|---|---|
| T-learner | 0.0043 | 0.0014 | 0.072 | 0.50 |
| S-learner | 0.0057 | 0.0029 | 0.041 | 0.66 |
| Random | 0.0014 | −0.0014 | −0.015 | 0.007 |

По-сегментное восстановление (предсказание против эмпирического ground truth):

| Сегмент | Truth (binary uplift) | T-learner | S-learner |
|---|---|---|---|
| new | 0.110 | 0.126 | 0.120 |
| returning | 0.010 | 0.018 | 0.019 |

Модель восстанавливает, что «новые» пользователи реагируют ~10× сильнее «возвращающихся» — тот самый сигнал таргетинга, по которому действовала бы скидочная кампания.

Оговорка о честности: латентная ground-truth τ равна 0.60 (new) / 0.08 (returning), но *конверсионный* uplift ~0.11 / 0.01, потому что сигмоида при высокой базовой конверсии (~71%) дампит большие латентные эффекты. Сравнивать предсказанный бинарный uplift с латентной τ было бы несовпадением шкал; мы приводим ранговую корреляцию (без масштаба) и по-сегментное эмпирическое восстановление (одна шкала).

## Run

```bash
uv run --with pandas --with numpy python data/generate_data.py
uv run --with pandas --with numpy --with scikit-learn --with lightgbm --with matplotlib python run.py
uv run --with pandas --with numpy --with scikit-learn --with lightgbm --with matplotlib --with pytest pytest -q
```

Результаты: `reports/metrics.json` + `reports/uplift.png` (QINI-кривые + сегментный uplift против ground truth).

## Insight

CUPED даёт мощность бесплатно, если есть ковариата из пред-периода — не нужен новый дизайн эксперимента, только лучший оценщик на уже собранных данных. Uplift-моделирование отвечает на другой вопрос, чем A/B-тест: не «работает ли воздействие в среднем», а «на ком оно работает». Эти два метода дополняют друг друга, а не заменяют. Синтетика с истинным гетерогенным эффектом — единственная причина, по которой восстановление вообще можно проверить: на реальных данных ITE не наблюдается никогда, и это фундаментальная проблема causal inference.

## Impact

- **CUPED** — та же оценка ATE, стандартная ошибка −26%, CI в 1.35× уже.
- **Экономия трафика** — 10k → ~5.6k пользователей на руку при той же мощности.
- **Uplift** — T- и S-learner бьют random по AUUC, Qini и uplift@20%.
- **Таргетинг** — восстановленный эффект «new ~10× returning» превращает скидки из «всем» в адресные.

## Documentation

- [GitHub → causal-uplift](https://github.com/NikitaBoyarkin/causal-uplift)
