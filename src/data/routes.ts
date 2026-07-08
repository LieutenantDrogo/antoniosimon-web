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
