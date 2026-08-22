import { describe, it, expect } from 'vitest';
import { categoryLabel } from '../../src/lib/categories';

describe('categoryLabel', () => {
  it('maps known categories for ru and en', () => {
    expect(categoryLabel('guide', 'ru')).toBe('Гайды');
    expect(categoryLabel('guide', 'en')).toBe('Guides');
    expect(categoryLabel('decision-log', 'ru')).toBe('Журнал решений');
  });

  it('humanizes unknown categories', () => {
    expect(categoryLabel('ab-testing', 'en')).toBe('Ab Testing');
  });
});