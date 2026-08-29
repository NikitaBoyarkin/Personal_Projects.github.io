// Testimonials — data source for the homepage recommendation strip.
// Empty by design: the block renders nothing until the first entry appears.
// To publish a recommendation, add one object per quote here (order matters —
// the first entry shows first). Keep quotes verbatim and link the author's
// public profile when they have one (LinkedIn / GitHub).
//
// How to collect:
//   TESTIMONIALS.md (repo root) — ready-to-send RU/EN request template.

export interface Testimonial {
  /** Verbatim quote from the author (keep their wording, no editing). */
  quote: string;
  /** Full name as the author publishes it. */
  name: string;
  /** Role / title the author held when they worked with you. */
  role?: string;
  /** Company or product context (e.g. "Аналитик · fintech-стартап"). */
  company?: string;
  /** Public profile link (LinkedIn / GitHub). */
  url?: string;
}

export const testimonials: Testimonial[] = [];

/** Expose the length so the block can skip rendering when empty. */
export const hasTestimonials: boolean = testimonials.length > 0;
