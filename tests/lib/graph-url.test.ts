import { describe, it, expect } from 'vitest';
import { decodeGraphState, encodeGraphState } from '../../src/lib/graph-url';

describe('decodeGraphState', () => {
  it('returns the defaults for an empty search', () => {
    expect(decodeGraphState('')).toEqual({ mode: 'group', hiddenGroups: [], hiddenCommunities: [] });
    expect(decodeGraphState('?utm_source=x')).toEqual({
      mode: 'group',
      hiddenGroups: [],
      hiddenCommunities: [],
    });
  });

  it('parses community mode plus group and community hidden sets', () => {
    expect(decodeGraphState('?mode=community&hideGroups=topic,note&hideC=2,3')).toEqual({
      mode: 'community',
      hiddenGroups: ['topic', 'note'],
      hiddenCommunities: [2, 3],
    });
  });

  it('treats missing or unknown mode as group', () => {
    expect(decodeGraphState('?mode=banana&hideGroups=topic').mode).toBe('group');
    expect(decodeGraphState('?mode=x').mode).toBe('group');
  });

  it('drops malformed entries', () => {
    expect(decodeGraphState('?hideGroups=,topic,,note&hideC=2,,x,3')).toEqual({
      mode: 'group',
      hiddenGroups: ['topic', 'note'],
      hiddenCommunities: [2, 3],
    });
  });
});

describe('encodeGraphState', () => {
  it('returns an empty string for the default state', () => {
    expect(encodeGraphState({ mode: 'group', hiddenGroups: [], hiddenCommunities: [] })).toBe('');
  });

  it('serializes mode and both hidden sets', () => {
    const q = encodeGraphState({
      mode: 'community',
      hiddenGroups: ['topic'],
      hiddenCommunities: [2, 3],
    });
    // URLSearchParams percent-encodes the comma separator inside the value;
    // decode still splits it back into [2, 3].
    expect(q).toBe('?mode=community&hideGroups=topic&hideC=2%2C3');
  });

  it('merges into existing search and keeps unrelated params', () => {
    const q = encodeGraphState(
      { mode: 'community', hiddenGroups: ['topic'], hiddenCommunities: [2] },
      '?utm_source=x&mode=group',
    );
    expect(q).toBe('?utm_source=x&mode=community&hideGroups=topic&hideC=2');
  });

  it('drops stale params when state returns to defaults', () => {
    const q = encodeGraphState(
      { mode: 'group', hiddenGroups: [], hiddenCommunities: [] },
      '?mode=community&hideGroups=topic&hideC=2&utm=x',
    );
    expect(q).toBe('?utm=x');
  });

  it('round-trips through decode', () => {
    const state = { mode: 'community' as const, hiddenGroups: ['topic', 'note'], hiddenCommunities: [3] };
    expect(decodeGraphState(encodeGraphState(state, '?utm=1'))).toEqual(state);
  });
});
