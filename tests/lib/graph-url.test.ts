import { describe, it, expect } from 'vitest';
import { decodeGraphState, encodeGraphState } from '../../src/lib/graph-url';

const EMPTY = { mode: 'group' as const, hiddenGroups: [], hiddenCommunities: [], hiddenEdges: [] };

describe('decodeGraphState', () => {
  it('returns the defaults for an empty search', () => {
    expect(decodeGraphState('')).toEqual(EMPTY);
    expect(decodeGraphState('?utm_source=x')).toEqual(EMPTY);
  });

  it('parses community mode plus hidden sets and edge types', () => {
    expect(decodeGraphState('?mode=community&hideGroups=topic,note&hideC=2,3&hideEdges=topic,shared')).toEqual({
      mode: 'community',
      hiddenGroups: ['topic', 'note'],
      hiddenCommunities: [2, 3],
      hiddenEdges: ['topic', 'shared'],
    });
  });

  it('treats missing or unknown mode as group', () => {
    expect(decodeGraphState('?mode=banana&hideGroups=topic').mode).toBe('group');
    expect(decodeGraphState('?mode=x').mode).toBe('group');
  });

  it('drops malformed entries', () => {
    expect(decodeGraphState('?hideGroups=,topic,,note&hideC=2,,x,3&hideEdges=,core,,topic')).toEqual({
      mode: 'group',
      hiddenGroups: ['topic', 'note'],
      hiddenCommunities: [2, 3],
      hiddenEdges: ['core', 'topic'],
    });
  });
});

describe('encodeGraphState', () => {
  it('returns an empty string for the default state', () => {
    expect(encodeGraphState(EMPTY)).toBe('');
  });

  it('serializes mode, both hidden sets and hidden edge types', () => {
    const q = encodeGraphState({
      mode: 'community',
      hiddenGroups: ['topic'],
      hiddenCommunities: [2, 3],
      hiddenEdges: ['topic', 'shared'],
    });
    // URLSearchParams percent-encodes the comma separator inside a value;
    // decode still splits it back into the separate entries.
    expect(q).toBe('?mode=community&hideGroups=topic&hideC=2%2C3&hideEdges=topic%2Cshared');
  });

  it('merges into existing search and keeps unrelated params', () => {
    const q = encodeGraphState(
      { mode: 'community', hiddenGroups: ['topic'], hiddenCommunities: [2], hiddenEdges: ['core'] },
      '?utm_source=x&mode=group',
    );
    expect(q).toBe('?utm_source=x&mode=community&hideGroups=topic&hideC=2&hideEdges=core');
  });

  it('drops stale params when state returns to defaults', () => {
    const q = encodeGraphState(
      { mode: 'group', hiddenGroups: [], hiddenCommunities: [], hiddenEdges: [] },
      '?mode=community&hideGroups=topic&hideC=2&hideEdges=core&utm=x',
    );
    expect(q).toBe('?utm=x');
  });

  it('round-trips through decode', () => {
    const state = {
      mode: 'community' as const,
      hiddenGroups: ['topic', 'note'],
      hiddenCommunities: [3],
      hiddenEdges: ['shared'],
    };
    expect(decodeGraphState(encodeGraphState(state, '?utm=1'))).toEqual(state);
  });
});
