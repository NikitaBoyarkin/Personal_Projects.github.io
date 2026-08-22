import { describe, it, expect } from 'vitest';
import { formatDate, estimateReadTime } from '../../src/lib/date';

describe('formatDate', () => {
  it('formats a Date as en-US medium', () => {
    expect(formatDate(new Date('2026-08-05T00:00:00Z'))).toBe('Aug 5, 2026');
  });

  it('accepts an ISO string', () => {
    expect(formatDate('2026-08-05')).toBe('Aug 5, 2026');
  });
});

describe('estimateReadTime', () => {
  it('returns at least 1 minute', () => {
    expect(estimateReadTime('')).toBe(1);
    expect(estimateReadTime('one')).toBe(1);
  });

  it('rounds ~200 wpm', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(estimateReadTime(words)).toBe(2);
  });
});