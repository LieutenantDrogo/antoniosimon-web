import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const bilingual = z.object({ en: z.string(), es: z.string() });
const stringOrBilingual = z.union([z.string(), bilingual]);

const site = defineCollection({
  loader: file('src/content/site.yaml'),
  schema: z.object({
    email: z.string(),
    emailTodo: z.boolean().optional(),
    pressKit: z.object({
      path: z.string(),
      todo: z.boolean().optional(),
      label: bilingual,
    }),
    press: z.array(z.string()),
    quote: z.object({ text: z.string(), who: z.string() }),
  }),
});

const pages = defineCollection({
  loader: file('src/content/pages.yaml'),
  schema: z.object({
    eyebrow: bilingual,
    display: z.string(),
    displayItalic: z.boolean().optional(),
    lede: bilingual.optional(),
    metaDescription: bilingual,
    cta: z.array(z.object({ label: bilingual, page: z.string() })).optional(),
    notebox: bilingual.optional(),
    note: bilingual.optional(),
    reclistEyebrow: bilingual.optional(),
    recordLabel: bilingual.optional(),
  }),
});

const agenda = defineCollection({
  loader: file('src/content/agenda.yaml'),
  schema: z.object({
    dateLabel: bilingual,
    what: bilingual,
    where: stringOrBilingual.optional(),
    tbc: z.boolean().optional(),
    sample: z.boolean().optional(),
    order: z.number(),
  }),
});

const programmes = defineCollection({
  loader: file('src/content/programmes.yaml'),
  schema: z.object({
    title: bilingual,
    desc: bilingual,
    duration: z.string(),
    forces: bilingual,
    order: z.number(),
  }),
});

const research = defineCollection({
  loader: file('src/content/research.yaml'),
  schema: z.object({
    title: bilingual,
    // may contain inline `.todo` spans verbatim from v10 — rendered with set:html
    descHtml: bilingual,
    order: z.number(),
  }),
});

const recordings = defineCollection({
  loader: file('src/content/recordings.yaml'),
  schema: z.object({
    title: bilingual,
    desc: bilingual,
    order: z.number(),
  }),
});

const videos = defineCollection({
  loader: file('src/content/videos.yaml'),
  schema: z.object({
    youtubeId: z.string(),
    todo: z.boolean().optional(),
    caption: bilingual.optional(),
    locked: z.boolean().optional(),
    captionBold: bilingual.optional(),
    captionRest: bilingual.optional(),
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
    record: z.array(z.object({
      dt: bilingual,
      dd: stringOrBilingual,
    })),
  }),
});

export const collections = {
  site, pages, agenda, programmes, research, recordings, videos, manifesto, bio,
};
