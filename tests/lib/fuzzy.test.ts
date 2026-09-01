import { describe, it, expect } from 'vitest';
import { ldWithin } from '../../src/lib/fuzzy';

describe('ldWithin', () => {
  it('accepts exact and near matches', () => {
    expect(ldWithin('retention', 'retention')).toBe(true);
    expect(ldWithin('retenchion', 'retention')).toBe(true); // 2 edits
    expect(ldWithin('retantion', 'retention')).toBe(true); // 1 edit
    expect(ldWithin('sql', 'sql')).toBe(true);
  });

  it('rejects matches beyond max edits', () => {
    expect(ldWithin('retention', 'retentionanalysis')).toBe(false); // len diff 8
    expect(ldWithin('abcde', 'vwxyz')).toBe(false); // 5 edits
    expect(ldWithin('ab', 'abcdef')).toBe(false); // len diff 4
  });

  it('handles empty strings', () => {
    expect(ldWithin('', '')).toBe(true);
    expect(ldWithin('ab', '')).toBe(true); // 2 insertions — exactly at max
    expect(ldWithin('abc', '')).toBe(false); // 3 > max — len-diff guard
  });

  it('is symmetric and Cyrillic-safe (char-code based)', () => {
    expect(ldWithin('retention', 'retenchion')).toBe(true);
    expect(ldWithin('тест', 'тес')).toBe(true); // 1 deletion
    expect(ldWithin('аааа', 'аабб')).toBe(true); // 2 substitutions
  });
});
