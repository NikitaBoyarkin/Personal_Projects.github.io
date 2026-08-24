// Shared project-board configuration for RU/EN locales.
// Single source of truth for the display order and the track (category) taxonomy
// used by ProjectBoard and ProjectSpotlight.

export const PROJECT_ORDER = ['volta', 'ab', 'supabase', 'posthog', 'streamlit', 'sales-calls', 'sql', 'rfm', 'cohort', 'ml', 'bot', 'scrolly', 'garden', 'site'];

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