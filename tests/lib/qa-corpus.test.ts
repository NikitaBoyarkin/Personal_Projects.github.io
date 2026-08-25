import { describe, it, expect } from 'vitest';
import { QA_CORPUS, normalizeQuery, scorePair, bestMatch } from '../../src/lib/qa-corpus';

describe('QA_CORPUS', () => {
  it('has unique ids', () => {
    const ids = QA_CORPUS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has both locales for every pair', () => {
    for (const p of QA_CORPUS) {
      expect(p.ru.question.length).toBeGreaterThan(0);
      expect(p.en.question.length).toBeGreaterThan(0);
      expect(p.ru.answer.length).toBeGreaterThan(0);
      expect(p.en.answer.length).toBeGreaterThan(0);
    }
  });

  it('stores relative hrefs (no base, no leading slash)', () => {
    for (const p of QA_CORPUS) {
      for (const locale of [p.ru, p.en]) {
        for (const link of locale.links ?? []) {
          expect(link.href.startsWith('/')).toBe(false);
          expect(link.href.startsWith('http')).toBe(false);
        }
      }
    }
  });

  it('covers the core recruiter topics', () => {
    const ids = QA_CORPUS.map((p) => p.id);
    for (const id of ['who', 'role', 'experience', 'stack', 'ab-testing', 'retention', 'segmentation', 'sql', 'automation', 'volta', 'contact', 'cv']) {
      expect(ids).toContain(id);
    }
  });
});

describe('normalizeQuery', () => {
  it('lowercases, strips punctuation, collapses spaces', () => {
    expect(normalizeQuery('  A/B-тесты,  SQL!  ')).toBe('a b тесты sql');
  });

  it('keeps cyrillic and digits', () => {
    expect(normalizeQuery('CUPED p<0.0001')).toBe('cuped p 0 0001');
  });
});

describe('scorePair', () => {
  const pair = QA_CORPUS.find((p) => p.id === 'ab-testing')!;

  it('returns -1 when a token matches no keyword', () => {
    expect(scorePair(pair, ['zzzqqq'])).toBe(-1);
  });

  it('scores full keyword matches higher than substring', () => {
    const full = scorePair(pair, ['тест']); // exact keyword → 2
    const sub = scorePair(pair, ['тестир']); // substring of keyword → 1
    expect(full).toBeGreaterThan(sub);
  });
});

describe('bestMatch', () => {
  it('matches a RU query about A/B testing', () => {
    const m = bestMatch('что с a/b тестами?');
    expect(m?.id).toBe('ab-testing');
  });

  it('matches an EN query about SQL', () => {
    const m = bestMatch('how strong is your sql');
    expect(m?.id).toBe('sql');
  });

  it('matches contacts', () => {
    const m = bestMatch('как с тобой связаться');
    expect(m?.id).toBe('contact');
  });

  it('returns null for an empty or unmatched query', () => {
    expect(bestMatch('')).toBeNull();
    expect(bestMatch('zzzqqq')).toBeNull();
  });
});
