# BUILD.md — antoniosimon.es

Handoff brief from the design phase (Claude.ai, July 2026) to implementation (Claude Code).
This document is the single source of truth for intent and locked decisions. The file
`antoniosimon-v10.html` is the single source of truth for visual output. **The acceptance
bar for the build is visual parity with v10** — this is a port, not a redesign.

---

## 1. What this site is

Artist site for Antonio Simón — pianist & fortepianist. Primary audience: festival
programmers and gatekeepers, international first (hence English-primary). Secondary:
press, conference organizers.

Positioning: a performer with deep research behind him — not an academic who also plays.
The visual thesis is deliberate dissonance: contemporary, editorial, un-HIP surface
("radical surface") over a ruthlessly scannable information skeleton ("conservative
skeleton"). The intellectual spine is Verdi's *torniamo all'antico, e sarà un progresso*:
the past as avant-garde.

## 2. Locked design decisions — do not relitigate

1. **Two registers.**
   - *Rooms* (Home, Manifesto, Agenda, About, Contact): full-bleed portrait environments,
     photos fused edge-lessly into color grounds derived from each photo's own shadows.
   - *Documents* (Programmes, Media, Research): flat tinted grounds, no portraits,
     scannable product/evidence sheets. The sobriety is intentional signal for the
     person with the budget.
   - Rule: fused imagery = persona; framed imagery = evidence. (Currently no framed
     imagery on-site; journalistic photos live in the press kit.)

2. **Typography is semantic, not decorative.**
   - *Instrument Serif* (400, roman + italic) = the spoken voice: display headlines,
     manifesto body, pull quote, programme titles, agenda "what" lines, the email.
   - *Archivo* (400/500/600) = the apparatus: nav, eyebrows, labels, meta rows, body
     prose on document pages, captions, the Record block.
   - The serif never does utility; the sans never makes statements. Self-host both as
     WOFF2 (SIL OFL) — no Google Fonts CDN (GDPR + performance).

3. **The signature: dislocation echo.** Each page's display headline has a ghost
   duplicate in the page key color: offset `translate(.09em, -.05em)`, opacity `.34`,
   1.2s drift-in animation, disabled under `prefers-reduced-motion`. One per page,
   nowhere else.

4. **Color worlds** (ground / ink / key / dim — four CSS custom properties per page):

   | page       | ground    | ink       | key       | dim       |
   |------------|-----------|-----------|-----------|-----------|
   | home       | `#11110a` | `#EDEBDC` | `#D9C95A` | `#9a976f` |
   | manifesto  | `#150a10` | `#F4E7DC` | `#F0784C` | `#a97f6e` |
   | programmes | `#0e0f10` | `#E8E6DE` | `#C9C4AE` | `#83857e` |
   | agenda     | `#0d0d0d` | `#EAEAEA` | `#DADADA` | `#848484` |
   | media      | `#0d0f0b` | `#EDEBDC` | `#D9C95A` | `#8c8a70` |
   | research   | `#0f0e10` | `#E8E6DE` | `#B9B3C9` | `#807c8a` |
   | about      | `#12130b` | `#EDEBDC` | `#C7BC55` | `#93916c` |
   | contact    | `#12120c` | `#EDEBDC` | `#D9C95A` | `#93916c` |

   Grounds were sampled from the photographs' dark quintile — keep them exact. Ink is not flat
   site-wide: manifesto and the two document pages (programmes, research) carry a warmer/cooler
   ink than the rest — keep the per-page value exact, not a single site-wide ink.

5. **Photo fusion is baked, not runtime.** Portraits carry their dissolve in their own
   alpha channel (see §5, image pipeline). No CSS mask feathering of photos. Photos
   render at natural aspect (height-driven on desktop, width-driven on mobile), never
   `object-fit: cover` — cropping can amputate the baked fade.

6. **Photo environments occupy the first viewport only** (`100svh`), dissolving downward
   via a smootherstep-stopped container mask, so long pages read over clean ground.

7. **Film grain overlay** site-wide: SVG `feTurbulence` data-URI, `opacity .06`,
   `mix-blend-mode: overlay`, fixed. It doubles as alpha-fade de-banding.

8. **Nav**: fixed; fluid `clamp()` type/gaps; wraps below 980px (brand + language toggle
   row, sections flowing beneath); no hamburger; active section underlined in key color.
   v10 is not ground truth for the nav backdrop — see "Divergences from v10" below.

9. **Videos**: click-to-play facade posters (thumbnail + play button → injects
   `youtube-nocookie` iframe with autoplay). Never eager iframes.

## Divergences from v10

Collected here rather than scattered through §2 — v10 is not ground truth for either of
these; do not "fix" them back by comparing screenshots against `antoniosimon-v10.html`.

- **Nav backdrop & mobile photo dissolve.** v10's nav sat on an opaque-ish gradient
  (`color-mix(..., 94%, transparent)` bands) that read as a hard bar of chrome over the
  photo. Final: no background on nav at any width; legibility comes from `text-shadow`
  on `nav a` (the same mechanism `.lede` uses everywhere else); the mobile portrait's
  alpha now ramps up from 0 at its own top edge too, not just down at the bottom (§5),
  so the nav sits over haze rather than a flat band. **Rejected:** offsetting `.env`'s
  `top` below the wrapped nav — that just puts the nav on solid ground (the same problem
  restated) plus a hard seam at the photo's new top edge.
- **Ground/ink lives on `<html>`, not `<body>`.** v10 was a single-page app with one
  `<body>` for its whole life, so `body{transition:background-color .7s}` was enough.
  Astro's ClientRouter fully replaces `<body>` on every navigation — only `<html>`
  persists — so the per-page custom properties and that CSS transition had to move
  there. `color`/`border-color` transition via the view-transition root crossfade
  instead (§3), since a freshly-inserted body has no prior value to transition from.

## 3. Architecture (as built)

- **Framework:** Astro 7 (`astro@^7.0.7`), static output. Zero client JS except
  `VideoPoster.astro`'s facade script and `<ClientRouter />` itself. The prototype's JS
  "tab router" is gone — the 8 sections are real routed `.astro` pages.
- **Content:** Content Layer API, collections defined in `src/content.config.ts` (the
  Astro 7 location — not the legacy `src/content/config.ts`). See "Content model" below.
- **View Transitions: adopted**, not optional. Astro's `<ClientRouter />` preserves the
  cross-page color-world crossfade of the prototype instead of a hard page-load snap.
  Mechanism:
  - `html[data-page="…"]` (not `body` — see "Divergences from v10") holds the per-page
    `--bg/--ink/--key/--dim` custom properties. `<html>` persists across navigation and
    Astro rewrites its attributes per route, so this is always correct, never stale.
  - The `.7s var(--ease)` melt is delivered by two mechanisms at the same tempo:
    `background-color` as a real CSS `transition` on `html` (survives because `html`
    persists), and `color`/`border-color` via Astro's view-transition root crossfade —
    `::view-transition-old(root), ::view-transition-new(root){animation-duration:.7s;
    animation-timing-function:var(--ease)}` — since a freshly-inserted `body` has no
    prior computed value to transition *from*.
  - `prefers-reduced-motion`: the `html` transition is dropped (`transition:none`), and
    ClientRouter's own reduced-motion handling disables the view-transition crossfade —
    both independently, so reduced motion means a hard instant swap, not a fake-fast one.
  - The dislocation echo (§2.3) re-runs once per navigation for free: `.display::before`
    is a fresh element on every route (body is fully replaced), and its `animation`
    has no `infinite` — one play per mount, including back/forward, never zero, never
    more than one.
- **Hosting:** GitHub (private repo) → Cloudflare Pages, build on push. *(Not yet done —
  session 2; see §8.)*
- **Domain:** antoniosimon.es (live; currently a single-page hero — identify registrar/
  DNS before cutover; site stays live until the new build is approved on `*.pages.dev`).
  *(Not yet done — session 2; see §8.)*

### Stack (pinned)

- **Node 26.x** (installed via Homebrew on the build machine; `package.json` `engines`
  requires `>=22.12.0`, so any current LTS/latest works — 26 is what was actually used).
- **Astro `^7.0.7`**, `@astrojs/sitemap@^3.7.3`.
- **TypeScript `^6.0.3`**, `@astrojs/check@^0.9.9` — `npx astro check` is the typecheck
  entrypoint; `astro/tsconfigs/strict` as the base config.
- **`@fontsource/instrument-serif` / `@fontsource/archivo`** — devDependencies only. Used
  once to extract self-hosted WOFF2 into `public/fonts/`; never imported at runtime, so
  they don't ship in the built site.
- **Python 3.9 + Pillow + numpy**, in a local `.venv` (`scripts/requirements.txt`).
  Manual-only (`npm run images`) — never part of `astro build`, so Cloudflare's build
  environment never needs Python.

### Routes

English is primary (root); Spanish mirrors under `/es/` with localized slugs:

```
/            /es/
/manifesto   /es/manifiesto
/programmes  /es/programas
/agenda      /es/agenda
/media       /es/medios
/research    /es/investigacion
/about       /es/biografia
/contact     /es/contacto
```

(`src/pages/*.astro` for English, `src/pages/es/*.astro` for Spanish — one file per
route, no dynamic `[...slug]` catch-all.) `hreflang` pairs on every page; canonical per
language; the language toggle (`LangSwitch.astro`) maps the *current* page to its
counterpart slug via a shared `routes` map in `src/data/routes.ts` — never to home.

### Components

`src/components/`: `Nav` (semantic `<ul>`/`<a href>`, `aria-current="page"`, wraps
`LangSwitch`) · `LangSwitch` · `PhotoEnv` (amb + scrim + `<picture>`, reads
`src/data/images.json` for the pipeline's per-slot paths/alt/filter) · `DisplayHeading`
(echo via `data-text`, `italic` prop for the manifesto title) · `ProgrammeRow` (reused
for Programmes' title+desc+meta rows, Media's Recordings & screen list, and Research's
title+descHtml list — one component, three call shapes, matching v10's own reuse of a
single `.prog` class) · `AgendaRow` · `RecordList` · `VideoPoster` (facade button, binds
its click handler on `astro:page-load` — `DOMContentLoaded` doesn't refire on
client-side navigations, so the Media page's video facade would go dead after any
client-side nav into it otherwise). `src/layouts/BaseLayout.astro` holds `<head>`,
fonts, grain, `<Nav>`, `<footer>`, `<ClientRouter />`.

### Content model (edited by Antonio, no code)

Content Layer collections in `src/content.config.ts`. Two loader shapes: `file()` for
YAML — as an object keyed by id (`{id: {...fields}}`), not an array, per the loader's
own requirement for unique ids — and `glob()` for the per-language Markdown, with an
explicit `generateId` (`manifesto.en.md` → id `manifesto.en`).

```
src/content/
  agenda.yaml       # {id: {dateLabel:{en,es}, what:{en,es}, where?: string|{en,es},
                    #      tbc?, sample?, order}}
  programmes.yaml   # {id: {title:{en,es}, desc:{en,es}, duration, forces:{en,es}, order}}
  research.yaml     # {id: {title:{en,es}, descHtml:{en,es}, order}}
  recordings.yaml   # {id: {title:{en,es}, desc:{en,es}, order}}
  videos.yaml       # {id: {youtubeId, todo?, caption?:{en,es}, locked?,
                     #      captionBold?:{en,es}, captionRest?:{en,es}, order}}
  pages.yaml        # {pageId: {eyebrow:{en,es}, display, displayItalic?, lede?:{en,es},
                     #          metaDescription:{en,es}, cta?, notebox?, note?,
                     #          reclistEyebrow?, recordLabel?}}
  manifesto.en.md   manifesto.es.md
  bio.en.md         bio.es.md   # frontmatter: record: [{dt:{en,es}, dd: string|{en,es}}]
  site.yaml         # {site: {email, emailTodo?, pressKit:{path,todo?,label:{en,es}},
                     #        press: string[], quote:{text,who}}}
```

`agenda.yaml`'s `sample:true` rows render at `.agrow.sample` (opacity `.38`) — the two
`[Programme]/[Venue · City]` placeholder rows. `pages.yaml` and `videos.yaml` are
extensions beyond what §3 originally specified: `pages.yaml` holds each page's hero
copy and meta description (nowhere else to put per-page strings that aren't a list);
`videos.yaml` holds the two YouTube IDs and their captions (one `.todo`, one locked per
§4). The About "Record/Datos" definition list lives in `bio.*.md` frontmatter rather
than its own collection, since it's specific to one page and one document per language
already exists there.

Adding a concert = adding a new keyed block to `agenda.yaml` (GitHub web editor is
enough); push triggers rebuild (~1 min).

## 4. Assets

Portraits (originals supplied by Antonio; process per §5):

| slot      | source file                                    | note |
|-----------|------------------------------------------------|------|
| HERO      | `46c908a6-….JPG` (frontal, green)              | |
| MANIFESTO | `554370f7-….JPG` (red, ghost double-exposure)  | |
| AGENDA    | `aedaa7cc-….JPG` (B&W light bars)              | render with `grayscale(1) contrast(1.05)` |
| ABOUT     | `Foto_Antonio_Simo_n_Color_2021.jpg` (profile) | **lowest res (768×960)** — replace with a higher-res frame from the same session if one exists |
| CONTACT   | `dc91dd17-….JPG` (green, direct gaze)          | |

Press-kit reserves (not on site): theatre harpsichord `IMG_4011.jpg` (**carries EXIF
rotation — apply `ImageOps.exif_transpose` before any processing**), red profile
eyes-closed, B&W flannel, three performance shots (currently Instagram screenshots —
**request originals**), Sv. Donat overhead (`zara.jpg`, low-res).

Video IDs: hero video `lOF9U-MJnAA`; modern-piano video `uA1FBEk8QI4` (caption locked:
"Same grammar, modern instrument. / La misma gramática, instrumento moderno.").

## 5. Image pipeline (build script, Python or Sharp)

For each portrait, from the EXIF-corrected original:

- **Desktop variant:** native size (~960×1200). Alpha = horizontal smootherstep
  (Perlin: `6t⁵ − 15t⁴ + 10t³`) from x = **2%** (alpha 0) to x = **52%** (alpha 255).
- **Mobile variant:** resize to 760px wide. Alpha = vertical smootherstep, both ends:
  **0** at y = **0%**, rising to **255** by y = **14%** (dissolves into the ground behind
  the fixed nav, not just at the bottom), opaque plateau to y = **50%**, falling to
  **0** by y = **99%**.
- **No dither in the alpha** (incompressible; the grain overlay de-bands optically).
- Export WebP, quality 80 (desktop) / 76 (mobile). As real files with hashed names —
  not base64 (that was a prototype constraint only).
- Serve via `<picture>`: `<source media="(max-width:820px)" srcset=mobile>` + desktop img.
- Ambient layers: 180px-wide Gaussian-blurred (σ≈20) copies, WebP q55, positioned
  `80% 30%`, opacity `.62`, `saturate(1.08)`.

Rationale (do not "simplify" back to CSS masks): smootherstep has zero first and second
derivative at both ends — no Mach bands; baked alpha survives any viewport; natural-
aspect rendering means the fade can never be cropped off.

## 6. SEO / meta / conformance

- `hreflang` en/es + `x-default`; sitemap; canonical per page.
- OG/Twitter image: a 1200×630 crop of the hero portrait (generate in pipeline).
- Per-page meta descriptions in both languages (write from existing copy).
- Nav is semantic navigation: a `<ul>` of real `<a href>` anchors (not buttons),
  `aria-current="page"` on the active item, inside `<nav aria-label>`.
- **View Transitions: adopted.** Astro's `<ClientRouter />` preserves the cross-page
  color-world crossfade of the prototype instead of a hard page-load snap; the
  `html[data-page]` mechanism and the `.7s` split (CSS transition on `<html>` for
  `background-color`, view-transition crossfade for `color`/`border-color`) are
  specified in full in §3.
- The dislocation echo stays static (drift-in on page load only). No cursor
  parallax, no scroll-triggered re-animation — the stillness is intentional.
- `prefers-reduced-motion`: disables echo drift and page fade.
- Keyboard: `:focus-visible` outlines in key color (already in v10 CSS).
- Alt texts: carry over from v10 verbatim.
- Lighthouse targets: Performance ≥ 95, A11y ≥ 95, SEO 100 (static site — achievable).
- No analytics at launch. If added later: Plausible or GoatCounter (no cookie banner).
- Contact is `mailto:` only. No forms, no backend.

## 7. Content TODO (Antonio's editing pass — placeholders marked `.todo` in v10)

- [ ] Confirm contact email (placeholder: `info@antoniosimon.es`)
- [ ] Manifesto rewrite, EN + ES (current text = approved placeholder draft)
- [ ] Bio rewrite, EN + ES (same status)
- [ ] Caption for hero video (piece — instrument — venue)
- [ ] Agenda: real dates (Stanford entry marked TBC; two sample rows to replace)
- [ ] Programme titles: review/rename ("The Last Word", "Beyond Legato",
      "Liszt, Complete", "The Roll Generation" are working titles)
- [ ] Research links: Perugia lecture video, thesis title + link, 2–3 selected articles
- [ ] Press kit PDF: assemble from reserve photos + bio EN/ES; place at
      `/press/antonio-simon-press-kit.pdf`
- [ ] Higher-res About portrait, if available
- [ ] Originals of the three performance photos (for the press kit)

## 8. Migration & cutover

1. Build in repo; deploy previews on `*.pages.dev`. **Done — session 2, as built below.**
2. Antonio reviews against v10 side by side (desktop wide, desktop narrow, mobile).
3. Identify current DNS control for antoniosimon.es; add domain to Cloudflare Pages.
4. Cut DNS. Old single-page site retires; no redirects needed (root-only site).
5. Post-launch: submit sitemap to Search Console.

### 8.1 Deploy config (session 2, as built)

- **Repo:** GitHub, private, `LieutenantDrogo/antoniosimon-web`, pushed over SSH.
  `.gitignore` covers `node_modules/`, `dist/`, `.astro/`, `.venv/`, `.DS_Store` — none
  of those were ever tracked. `public/img/*.webp` (16 files, baked alpha per §5) and
  `public/fonts/*.woff2` (5 files) are committed output, since the Cloudflare build
  runs neither the Python image pipeline nor `@fontsource`'s extraction step.
- **Cloudflare Pages:** connected via the dashboard's "Connect to Git" flow (the GitHub
  App authorization and initial project creation need a human in the browser — not
  automatable from the CLI/API side alone). Framework preset Astro; **build command**
  `npm run build`; **output directory** `dist`. Auto-deploys on every push to `main`.
- **Env vars** (Production, in the Pages project settings):
  - `NODE_VERSION=26` — pins the build image to match the local dev machine (§3's
    "Stack"); `package.json` `engines.node` only requires `>=22.12.0`, so this is a
    pin for parity, not a hard requirement.
  - `NOINDEX=true` — see below.
- **Preview noindex:** `<meta name="robots" content="noindex,nofollow">` in
  `BaseLayout.astro`, plus `src/pages/robots.txt.ts` (an Astro endpoint, not a static
  file, so it can read the same flag) emitting `Disallow: /`. Both gated on
  `import.meta.env.NOINDEX === 'true'`. The `*.pages.dev` subdomain always serves the
  Production deployment, and there's no separate preview-vs-prod-domain distinction
  until a custom domain is attached (session 3) — so the flag has to live on the
  Production environment now, not a Preview-only one.
  **Cutover (session 3):** in the Pages project's Production environment variables,
  delete `NOINDEX` (or set it to anything other than `'true'`) and trigger a redeploy —
  a one-line dashboard change, no code change. `robots.txt` flips to a permissive
  `Allow: /` + sitemap pointer automatically, since it reads the same flag.
- **Asset caching:** `public/_headers` (Cloudflare Pages' header-rules file) sets
  `Cache-Control: public, max-age=31536000, immutable` on `/_astro/*` (Astro's
  build-hashed JS/CSS), `/img/*` (hashed WebP names per §5), and `/fonts/*`
  (unhashed, but self-hosted static files that only change via a manual repo edit).
  Without this, Cloudflare's default is `max-age=0, must-revalidate` even on
  content-hashed paths.
- **Accessibility fix:** `BaseLayout.astro`'s `<slot />` is wrapped in `<main>` — a
  Lighthouse pass against the deployed preview caught a missing landmark region that
  didn't show up in local dev testing.
- **Verified on the deployed URL** (`https://antoniosimon-web.pages.dev/`): all 16
  routes 200 (Cloudflare 308s the extensionless path to the trailing-slash version,
  standard static-host behavior, not a bug); hreflang/canonical pairs correct on
  sampled EN/ES/document pages; fonts served same-origin with no `fonts.googleapis.com`
  references; `<picture>`/`<source media>` mobile-variant markup present; two-register
  rule holds (`programmes` has no `<picture>`, `agenda` does); sitemap lists all 16
  URLs. **Not directly click-tested** (no connected browser session in this pass):
  ClientRouter's cross-page color-world crossfade and the video facade's
  click-to-iframe swap. Both were confirmed statically — `ClientRouter`'s script tag
  and `astro-view-transitions-*` meta tags are present in the HTML, and the video
  poster buttons + their `astro:page-load`-bound inline script are present verbatim —
  but that's not the same as watching the crossfade or the iframe injection happen.
  Worth a manual look before Antonio's device review (step 2).
- **Lighthouse** (mobile + desktop, against the live preview, `NOINDEX=true` so SEO
  is depressed by design — see below):

  | category       | mobile | desktop |
  |----------------|--------|---------|
  | Performance    | 98     | 100     |
  | Accessibility  | 100    | 100     |
  | Best Practices | 100    | 100     |
  | SEO            | 69     | 69      |

  SEO's only failing audit is `is-crawlable` ("Page is blocked from indexing") — the
  intended effect of `NOINDEX=true` on a pre-launch preview, not a defect. With that
  flag removed at cutover, SEO should read at or near 100, matching §6's target.

## 9. Maintenance model

- **Content** (agenda, programmes, research, copy): YAML/Markdown edits, commit,
  auto-deploy. No tooling required beyond the GitHub web editor.
- **Design/code**: via Claude Code sessions against this repo. This file is the
  guardrail — parity with the locked decisions in §2 unless Antonio explicitly
  reopens one.
