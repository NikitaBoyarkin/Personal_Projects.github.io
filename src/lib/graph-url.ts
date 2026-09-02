// URL state for the knowledge graph: the color mode (taxonomy groups vs
// emergent communities) and the per-mode hidden sets, so a filtered or
// community view survives reload and can be shared as a link, e.g.
//   /graph/?mode=community&hideGroups=topic&hideC=2,3
// Pure string functions — no DOM — so they're unit-testable in vitest.
export interface GraphUrlState {
  mode: 'group' | 'community';
  /** Hidden taxonomy group names (applies in group mode). */
  hiddenGroups: string[];
  /** Hidden community ids (applies in community mode). */
  hiddenCommunities: number[];
}

const MODE_PARAM = 'mode';
const HIDE_GROUPS_PARAM = 'hideGroups';
const HIDE_COMMUNITIES_PARAM = 'hideC';

/** Serialize state into a query string (leading `?`, or `''` when every value
 *  is the default). Merges into `existing` search so unrelated params (e.g.
 *  analytics tags) survive a sync. */
export function encodeGraphState(state: GraphUrlState, existing: string = ''): string {
  const p = new URLSearchParams(existing);
  if (state.mode === 'community') p.set(MODE_PARAM, 'community');
  else p.delete(MODE_PARAM);
  if (state.hiddenGroups.length) p.set(HIDE_GROUPS_PARAM, state.hiddenGroups.join(','));
  else p.delete(HIDE_GROUPS_PARAM);
  if (state.hiddenCommunities.length) p.set(HIDE_COMMUNITIES_PARAM, state.hiddenCommunities.join(','));
  else p.delete(HIDE_COMMUNITIES_PARAM);
  const q = p.toString();
  return q ? `?${q}` : '';
}

/** Parse a query string (without the leading `?` it's still fine — URLSearchParams
 *  tolerates it) into state. Unknown params are ignored, malformed values dropped,
 *  and an empty search yields the defaults. */
export function decodeGraphState(search: string): GraphUrlState {
  const p = new URLSearchParams(search);
  const mode = p.get(MODE_PARAM) === 'community' ? 'community' : 'group';
  const hiddenGroups = (p.get(HIDE_GROUPS_PARAM) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const hiddenCommunities = (p.get(HIDE_COMMUNITIES_PARAM) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  return { mode, hiddenGroups, hiddenCommunities };
}
