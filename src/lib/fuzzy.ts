/**
 * True when `a` is within `max` single-character edits of `b` — plain
 * Levenshtein distance, DP with an early exit on the row minimum. Used by
 * SearchBox to recover typos ("retenchion" → "retention"). No library: the
 * index is tiny and this only runs after exact/prefix matches miss.
 * ponytail: naive LD; swap for a trie/FA only if the index grows large.
 * Works for Cyrillic too — it compares char codes, not ASCII words.
 */
export function ldWithin(a: string, b: string, max = 2): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > max) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1, // deletion
        cur[j - 1] + 1, // insertion
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), // match/substitution
      );
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    // Levenshtein never shrinks across rows — bail once the cheapest full
    // alignment already exceeds max.
    if (rowMin > max) return false;
    prev = cur;
  }
  return prev[b.length] <= max;
}
