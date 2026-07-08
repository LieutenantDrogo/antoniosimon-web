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

   **Divergence from v10 (v10 is NOT ground truth for nav background):** v10 used an
   opaque-ish gradient behind the nav — `linear-gradient(to bottom, color-mix(in srgb,
   var(--bg) 94%, transparent) 55%, transparent)` at desktop, hardened further to a
   94%-at-62% band under `max-width:980px`. Both read as a hard bar of chrome sitting on
   top of the photo, at odds with the "fused imagery, not framed" thesis in §2.1. Final
   mechanism, after two rounds of correction:

   - **No background on nav at any width.** Desktop uses a soft multi-stop scrim
     (86%→58%→24%→transparent at 0/42/72/100%) painted once, unconditionally; the
     `max-width:980px` wrapped state does not override it.
   - **Legibility comes from `text-shadow:0 1px 12px color-mix(in srgb, var(--bg) 80%,
     transparent)` on `nav a`** — the same mechanism `.lede` already uses site-wide to
     sit text over photos without an opaque backing.
   - **The mobile portrait dissolves at its top edge, not just its bottom** (§5's mobile
     alpha ramp gained a matching rise: 0 at y=0 → 255 by y=14%, plateau to y=50%, falls
     to 0 by y=99%). The nav sits over this haze instead of a hard photo edge or a flat
     band of ground. An earlier attempt instead offset `.env`'s `top` below the nav at
     `max-width:820px` — that was wrong and was reverted: it put the nav on *solid
     ground*, which is the same opaque-band problem restated, and left a hard horizontal
     seam where the offset photo began. Do not reintroduce a `.env` top offset here.
   - **Nav wrap shape at `max-width:980px`:** `.navlist` is a real flex item with
     `flex-basis:100%` (not `display:contents` at this breakpoint) so it's forced onto
     its own line — row 1 is brand + language toggle, row 2 is the section links. Below
     `max-width:520px`, `.navlist` also gets smaller type/gap and `nav` gets tighter
     side padding, because at small-phone widths the 7 links no longer fit row 2 on one
     line at full size; if that row wraps internally it produces a 3rd nav row tall
     enough to sit on fully-opaque photo (the alpha ramp above only clears ~14% of the
     photo's height, sized for a 2-row nav).

   Net effect: nav is never opaque or near-opaque at any width, and the photo is never
   offset behind it. Do not "fix" this back to v10's harder gradients — or reintroduce a
   `.env` top offset — by comparing screenshots against `antoniosimon-v10.html`. Both
   were tried and rejected; this is intentional divergence, not something to restore.

9. **Videos**: click-to-play facade posters (thumbnail + play button → injects
   `youtube-nocookie` iframe with autoplay). Never eager iframes.

## 3. Architecture

- **Framework:** Astro (latest), static output. Zero client JS except the video facade
  (a few lines, inline or tiny module). The prototype's JS "tab router" disappears —
  sections become real routed pages.
- **View Transitions:** use Astro's ClientRouter/View Transitions so the color-world
  modulation between sections survives the move to real pages (by default a hard page
  load would snap palettes instantly — the ~.7s melt between grounds is part of the
  design, a key change between movements). Transition `color` and `border-color` at the
  same tempo as `background-color` so the whole ecosystem mutates together, not just
  the ground. Degrades gracefully to instant swaps where the API is unsupported.
- **Hosting:** GitHub (private repo) → Cloudflare Pages, build on push.
- **Domain:** antoniosimon.es (live; currently a single-page hero — identify registrar/
  DNS before cutover; site stays live until the new build is approved on `*.pages.dev`).

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

`hreflang` pairs on every page; canonical per language; the language toggle maps the
*current* page to its counterpart slug (not to the home page).

### Components (suggested)

`BaseLayout` (head, fonts, grain, footer) · `Nav` · `PhotoEnv` (ambient layer +
`<picture>` sharp + scrim) · `DisplayHeading` (echo via `data-text`) · `ProgrammeRow` ·
`AgendaRow` · `RecordList` · `VideoPoster` · `LangSwitch`.

### Content model (edited by Antonio, no code)

```
src/content/
  agenda.yaml        # [{date, dateLabel: {en,es}, what: {en,es}, where, city, tbc?}]
  programmes.yaml    # [{title:{en,es}, desc:{en,es}, duration, forces:{en,es}, order}]
  research.yaml      # [{title:{en,es}, desc:{en,es}, url?, year?}]
  recordings.yaml    # [{title:{en,es}, desc:{en,es}, url?}]
  manifesto.en.md    manifesto.es.md
  bio.en.md          bio.es.md
  site.yaml          # email, press-kit path, press strip items, pull quote
```

Adding a concert = adding four lines to `agenda.yaml` (GitHub web editor is enough);
push triggers rebuild (~1 min).

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
- **Optional — decide during build:** Astro View Transitions to preserve the
  cross-page color-world crossfade of the prototype. If adopted, `color` and
  `border-color` must transition at the same tempo as `background-color` — the
  whole ecosystem mutates together. If not adopted, plain page loads are fine;
  do not fake it with JS.
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

1. Build in repo; deploy previews on `*.pages.dev`.
2. Antonio reviews against v10 side by side (desktop wide, desktop narrow, mobile).
3. Identify current DNS control for antoniosimon.es; add domain to Cloudflare Pages.
4. Cut DNS. Old single-page site retires; no redirects needed (root-only site).
5. Post-launch: submit sitemap to Search Console.

## 9. Maintenance model

- **Content** (agenda, programmes, research, copy): YAML/Markdown edits, commit,
  auto-deploy. No tooling required beyond the GitHub web editor.
- **Design/code**: via Claude Code sessions against this repo. This file is the
  guardrail — parity with the locked decisions in §2 unless Antonio explicitly
  reopens one.
