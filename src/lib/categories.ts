// Shared post-category → label mapping for RU/EN locales.
// Used by BlogFilter, BlogCard, MaterialStrip so badges stay consistent.
export const CATEGORY_LABELS: Record<string, { ru: string; en: string }> = {
  'decision-log': { ru: 'Журнал решений', en: 'Decision Log' },
  framework: { ru: 'Фреймворки', en: 'Frameworks' },
  guide: { ru: 'Гайды', en: 'Guides' },
  note: { ru: 'Заметки', en: 'Notes' },
};

export function categoryLabel(category: string, lang: 'ru' | 'en'): string {
  const entry = CATEGORY_LABELS[category];
  if (entry) return lang === 'en' ? entry.en : entry.ru;
  // Fallback: humanize the slug ("decision-log" → "Decision Log").
  return category.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}