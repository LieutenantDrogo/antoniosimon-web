import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

/** Every user-facing string is en+es. Proper nouns may stay a bare string. */
const bilingual = z.object({ en: z.string(), es: z.string() });
const stringOrBilingual = z.union([z.string(), bilingual]);

const PAGE_ID = z.enum([
  'home', 'manifesto', 'programmes', 'agenda', 'listen', 'research', 'about', 'contact',
]);

const site = defineCollection({
  loader: file('src/content/site.yaml'),
  schema: z.object({
    email: z.string(),
    city: bilingual,
    reach: bilingual,
    youtube: z.string(),
    press: z.array(z.string()),
    quote: z.object({ text: bilingual, who: z.string() }),
  }),
});

const pages = defineCollection({
  loader: file('src/content/pages.yaml'),
  schema: z.object({
    title: bilingual,            // <title>, per route
    eyebrow: bilingual,
    display: bilingual,          // the h1 — bilingual since v1 shipped four English h1s on /es/
    displayItalic: z.boolean().optional(),
    kicker: bilingual.optional(), // large serif line under the h1 (home only)
    lede: bilingual.optional(),
    metaDescription: bilingual,
    cta: z.array(z.object({ label: bilingual, page: PAGE_ID })).optional(),
    notebox: bilingual.optional(),
    note: bilingual.optional(),
    reclistEyebrow: bilingual.optional(),
    recordLabel: bilingual.optional(),
    shortBioLabel: bilingual.optional(),
  }),
});

/**
 * `date` is ISO. A day-less value ('2027-09') renders as month + year and is
 * flagged with `dayTbc`. `endDate` covers multi-day masterclasses.
 * Only publicly announceable, confirmed engagements live here.
 */
const agenda = defineCollection({
  loader: file('src/content/agenda.yaml'),
  schema: z.object({
    date: z.string(),
    endDate: z.string().optional(),
    dayTbc: z.boolean().optional(),
    kind: bilingual,
    what: bilingual,
    where: stringOrBilingual,
    detail: bilingual.optional(),
    url: z.string().optional(),
  }),
});

const programmes = defineCollection({
  loader: file('src/content/programmes.yaml'),
  schema: z.object({
    title: bilingual,
    subtitle: bilingual.optional(),
    desc: bilingual,
    kind: bilingual,
    forces: bilingual,
    duration: z.string().optional(),
    order: z.number(),
  }),
});

const research = defineCollection({
  loader: file('src/content/research.yaml'),
  schema: z.object({
    code: bilingual,
    title: bilingual,
    desc: bilingual,
    meta: z.string(),
    url: z.string().optional(),
    order: z.number(),
  }),
});

const recordings = defineCollection({
  loader: file('src/content/recordings.yaml'),
  schema: z.object({
    marker: z.string(),
    title: bilingual,
    desc: bilingual,
    meta: bilingual.optional(),
    url: z.string().optional(),
    urlLabel: bilingual.optional(),
    order: z.number(),
  }),
});

const videos = defineCollection({
  loader: file('src/content/videos.yaml'),
  schema: z.object({
    youtubeId: z.string(),
    composer: z.string(),
    work: bilingual,
    instrument: bilingual,
    caption: bilingual.optional(),
    order: z.number(),
  }),
});

const manifesto = defineCollection({
  loader: glob({
    pattern: 'manifesto.*.md',
    base: 'src/content',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({}),
});

const bio = defineCollection({
  loader: glob({
    pattern: 'bio.*.md',
    base: 'src/content',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    short: z.string(),
    record: z.array(z.object({ dt: bilingual, dd: stringOrBilingual })),
  }),
});

export const collections = {
  site, pages, agenda, programmes, research, recordings, videos, manifesto, bio,
};
