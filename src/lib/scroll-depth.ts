// Read-depth metric. A visitor "reads" a piece of content as they cross
// scroll-depth thresholds; content type decides which pages count. Kept as pure
// functions so the threshold logic is unit-tested without a browser.
//
// Generalizes the earlier case-study-only proof-reach metric (PRD v6 S3.2 /
// D14, `case_study_read` at 75%) into `read_depth` across content types
// (PRD `docs/prd-analytics-instrumentation.md`, REQ-A09).

/** Thresholds (percent) at which `read_depth` fires, at most once each. */
export const READ_DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;

export type ContentType = 'post' | 'case_study' | 'note';

export interface ContentInfo {
  content_type: ContentType;
  slug: string;
}

/** Legacy case-study read threshold, kept for parity tests. */
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
 * Percent thresholds reached at the given scroll position, oldest first.
 * Used to fire `read_depth` once per threshold per page load.
 */
export function thresholdsReached(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
): number[] {
  const pct = scrollDepthPct(scrollY, scrollHeight, innerHeight) * 100;
  return READ_DEPTH_THRESHOLDS.filter((threshold) => pct >= threshold);
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

/**
 * Content identity for `read_depth` (PRD §4.4). Returns null for pages that
 * are not measured (indexes, home, about, …).
 *
 * - `/projects/<slug>/…` → case_study
 * - `/posts/<slug>/…`    → post
 * - `/notes/<slug>/…`, `/topics/<slug>/…` → note
 */
export function contentInfo(path: string): ContentInfo | null {
  const m = path.match(/^\/(?:en\/)?(projects|posts|notes|topics)\/([^/]+)/);
  if (!m) return null;
  const section = m[1];
  const slug = m[2];
  if (section === 'projects') return { content_type: 'case_study', slug };
  if (section === 'posts') return { content_type: 'post', slug };
  return { content_type: 'note', slug };
}
