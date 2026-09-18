// Proof-reach metric (PRD v6 S3.2 / D14). A case study is counted as "read"
// once a visitor scrolls through CASE_STUDY_READ_DEPTH of a project page.
// Kept as a pure function so the threshold logic is unit-tested against the
// built site's behavior without a browser.

/** Case study counts as read at 75% scroll depth. */
export const CASE_STUDY_READ_DEPTH = 0.75;

/**
 * Fraction of the page scrolled, clamped to 0..1.
 * A page shorter than the viewport is treated as fully read (1).
 */
export function scrollDepthPct(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
): number {
  const scrollable = scrollHeight - innerHeight;
  if (scrollable <= 0) return 1;
  return Math.min(1, Math.max(0, scrollY / scrollable));
}

/** True once the visitor has passed the case-study read threshold. */
export function reachedCaseStudyRead(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
): boolean {
  return scrollDepthPct(scrollY, scrollHeight, innerHeight) >= CASE_STUDY_READ_DEPTH;
}

/**
 * Slug of the project case study a path points at, or null.
 * Matches `/projects/<slug>/…` and `/en/projects/<slug>/…`, including Volta
 * sub-parts (`/projects/volta/funnel/`), but never the `/projects/` index.
 */
export function caseStudySlug(path: string): string | null {
  const m = path.match(/^\/(?:en\/)?projects\/([^/]+)/);
  return m ? m[1] : null;
}
