export const PAGE_IDS = [
  'home', 'manifesto', 'programmes', 'agenda', 'listen', 'research', 'about', 'contact',
] as const;

export type PageId = typeof PAGE_IDS[number];
export type Lang = 'en' | 'es';

export const LANGS: Lang[] = ['en', 'es'];

/** Localized slug per BUILD.md §3 — hreflang pairs and the language toggle key off this map. */
export const routes: Record<PageId, Record<Lang, string>> = {
  home:       { en: '/',            es: '/es/' },
  manifesto:  { en: '/manifesto/',  es: '/es/manifiesto/' },
  programmes: { en: '/programmes/', es: '/es/programas/' },
  agenda:     { en: '/agenda/',     es: '/es/agenda/' },
  listen:     { en: '/listen/',     es: '/es/escuchar/' },
  research:   { en: '/research/',   es: '/es/investigacion/' },
  about:      { en: '/about/',      es: '/es/biografia/' },
  contact:    { en: '/contact/',    es: '/es/contacto/' },
};

/**
 * Nav row order, brand (home) excluded. Listen sits second — the site's first
 * claim is a sonic one, and the v12–v15 drafts had already moved it there.
 */
export const navOrder: PageId[] = [
  'manifesto', 'listen', 'programmes', 'agenda', 'research', 'about', 'contact',
];

/** Dropdown order: same list with home restored at the head, numbered 00–07. */
export const menuOrder: PageId[] = ['home', ...navOrder];

/** UI chrome, not editable content — tied 1:1 to PageId, changes require code anyway. */
export const navLabels: Record<PageId, Record<Lang, string>> = {
  home: { en: 'Antonio Simón', es: 'Antonio Simón' },
  manifesto: { en: 'Manifesto', es: 'Manifiesto' },
  listen: { en: 'Listen', es: 'Escuchar' },
  programmes: { en: 'Programmes', es: 'Programas' },
  agenda: { en: 'Agenda', es: 'Agenda' },
  research: { en: 'Research', es: 'Investigación' },
  about: { en: 'Biography', es: 'Biografía' },
  contact: { en: 'Contact', es: 'Contacto' },
};

/** Home's own label in the dropdown (the brand text is used in the header instead). */
export const homeMenuLabel: Record<Lang, string> = { en: 'Home', es: 'Inicio' };

export const uiStrings = {
  menu:       { en: 'Menu', es: 'Menú' },
  closeMenu:  { en: 'Close menu', es: 'Cerrar menú' },
  primaryNav: { en: 'Primary', es: 'Principal' },
  language:   { en: 'Language', es: 'Idioma' },
  skipToMain: { en: 'Skip to content', es: 'Ir al contenido' },
  upcoming:   { en: 'Upcoming', es: 'Próximamente' },
  recent:     { en: 'Recent', es: 'Recientes' },
  playVideo:  { en: 'Play', es: 'Reproducir' },
  watchOnYouTube: { en: 'Open on YouTube', es: 'Abrir en YouTube' },
  externalPlayerNote: {
    en: 'Playing a video loads the external YouTube player.',
    es: 'Al reproducir se carga el reproductor externo de YouTube.',
  },
} as const;
