export const PAGE_IDS = [
  'home', 'manifesto', 'programmes', 'agenda', 'media', 'research', 'about', 'contact',
] as const;

export type PageId = typeof PAGE_IDS[number];
export type Lang = 'en' | 'es';

/** Localized slug per §3 — hreflang pairs and the language toggle key off this map. */
export const routes: Record<PageId, Record<Lang, string>> = {
  home:       { en: '/',            es: '/es/' },
  manifesto:  { en: '/manifesto/',  es: '/es/manifiesto/' },
  programmes: { en: '/programmes/', es: '/es/programas/' },
  agenda:     { en: '/agenda/',     es: '/es/agenda/' },
  media:      { en: '/media/',      es: '/es/medios/' },
  research:   { en: '/research/',   es: '/es/investigacion/' },
  about:      { en: '/about/',      es: '/es/biografia/' },
  contact:    { en: '/contact/',    es: '/es/contacto/' },
};

/** Nav row order, brand (home) excluded — matches v10's [data-nav] button list. */
export const navOrder: PageId[] = [
  'manifesto', 'programmes', 'agenda', 'media', 'research', 'about', 'contact',
];

export const hasPhoto: Record<PageId, boolean> = {
  home: true, manifesto: true, programmes: false, agenda: true,
  media: false, research: false, about: true, contact: true,
};

/** UI chrome, not editable content — tied 1:1 to PageId, changes require code anyway. */
export const navLabels: Record<PageId, Record<Lang, string>> = {
  home: { en: 'Antonio Simón', es: 'Antonio Simón' },
  manifesto: { en: 'Manifesto', es: 'Manifiesto' },
  programmes: { en: 'Programmes', es: 'Programas' },
  agenda: { en: 'Agenda', es: 'Agenda' },
  media: { en: 'Media', es: 'Medios' },
  research: { en: 'Research', es: 'Investigación' },
  about: { en: 'About', es: 'Biografía' },
  contact: { en: 'Contact', es: 'Contacto' },
};
