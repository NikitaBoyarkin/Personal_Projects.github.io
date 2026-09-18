// Shared project-board configuration for RU/EN locales.
// Single source of truth for the display order and the track (category) taxonomy
// used by ProjectBoard and ProjectSpotlight.

export const PROJECT_ORDER = ['volta', 'ab', 'games', 'supabase', 'posthog', 'streamlit', 'sales-calls', 'sql', 'rfm', 'cohort', 'churn', 'causal', 'python', 'bot', 'scrolly', 'garden', 'site'];

// PRD v6 S2.6 — three headline case studies on the home page, each a distinct
// proof with at least one reachable public artifact:
//   volta  — experimentation + funnel + retention (public repo + demo)
//   sql    — analytics engineering (public repo + live report)
//   cohort — retention / product metrics (public repo + interactive demo)
// Private-repo projects (supabase, posthog, streamlit) stay in the compressed
// list until their S2.1–S2.3 compensating artifacts land; then they can swap in.
export const HEADLINE_PROJECTS = ['volta', 'sql', 'cohort'] as const;

const TRACKS = {
  ru: [
    { key: 'experiments', label: 'Эксперименты' },
    { key: 'analytics', label: 'Аналитика' },
    { key: 'product', label: 'Продукт' },
    { key: 'engineering', label: 'Инженерия' },
  ],
  en: [
    { key: 'experiments', label: 'Experiments' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'product', label: 'Product' },
    { key: 'engineering', label: 'Engineering' },
  ],
};

export function projectTracks(lang: 'ru' | 'en'): { key: string; label: string }[] {
  return lang === 'en' ? TRACKS.en : TRACKS.ru;
}