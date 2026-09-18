# CLAUDE.md

This is a port of `reference/antoniosimon-v10.html` to Astro. **BUILD.md is the
contract** — read it before making design or architecture decisions here. The
acceptance bar is visual parity with v10, with the two exceptions recorded in
BUILD.md itself (nav background §2 item 8; the ink/dim color table §2.4, which
BUILD.md now states correctly — v10 and BUILD.md should not disagree on colors).

## Hard rules (do not relitigate — see BUILD.md for full reasoning)

- **Two registers (§2.1).** Rooms (home/manifesto/agenda/about/contact) get a
  full-bleed `PhotoEnv`; documents (programmes/media/research) are flat grounds,
  no photos. Fused imagery = persona; framed imagery = evidence.
- **Color table (§2.4).** Ground/ink/key/dim are per-page CSS custom properties
  on `html[data-page="…"]` — not `body` (body is fully replaced by Astro's
  ClientRouter on navigation; only `html` persists, so it's the only element
  that can actually transition `background-color` across a nav). Use the exact
  values in BUILD.md §2.4, not v10's HTML — BUILD.md's table is the corrected
  version.
- **Fonts are semantic, not decorative (§2.2).** Instrument Serif = the spoken
  voice (headlines, manifesto, quotes). Archivo = the apparatus (nav, labels,
  meta, document body copy). Self-hosted WOFF2 in `public/fonts/`, no Google
  Fonts CDN.
- **Baked fades, not CSS masks (§2.5/§5).** Portrait alpha fades are baked into
  the WebP files by `scripts/build-images.py` (smootherstep, zero first/second
  derivative — no Mach bands). Never reach for `mask-image` or `opacity`
  gradients on `<img>` to fake this; regenerate the source images instead.
- **Header (§2 item 8, rewritten in session 3).** One link row at ≥1080px, a
  `<details>` dropdown below that — iPad portrait *and* landscape get the
  dropdown. No background at rest at any width; legibility comes from a two-stop
  `text-shadow` on header links (the same mechanism `.lede` uses) plus the
  portrait's own baked top-edge dissolve (§5's alpha ramp), so the header sits
  over haze rather than a hard photo edge. Past 18px of scroll it earns a
  translucent blurred strip (`.is-scrolled`). Never offset `.env`'s `top` to
  clear the header — tried and reverted, since it just puts the header on solid
  ground, which is the opaque-band problem restated. Do not "restore" v10's
  harder gradients either.
- **Two sections per photo page.** A room page is a full-viewport portrait hero
  plus, when it has list content, a `.listing` section on clean ground below.
  Agenda, About's Record table and Contact's grid live there. Do not move list
  content back over the portrait: the agenda photograph in particular is bright
  enough on its left half to swallow body copy.
- **Zero client JS** except two inline scripts and `<ClientRouter />`: the video
  facade (`VideoPoster.astro`) and the header script in `Nav.astro` (scroll
  state + menu Escape/outside-click). Both bind on `astro:page-load`, never
  `DOMContentLoaded`, which doesn't refire on client-side navigations.
- **One body per page.** Markup lives once in
  `src/components/pages/<Page>Body.astro` with a `lang` prop; the sixteen files
  in `src/pages/` are thin wrappers. Never edit an ES route's markup separately.

## Commands

```
npm run dev                            # dev server, localhost:4321
npm run build                          # static build to dist/
npm run preview                        # serve the build locally
npx astro check                        # typecheck
npm run images                         # regenerate public/img/ from source-photos/ (§5)
.venv/bin/python scripts/export-texts.py   # regenerate docs/TEXTOS.md from src/content/
```

`npm run images` is **manual-only, never part of `build`** — it needs the
Python venv at `.venv` (`pip install -r scripts/requirements.txt`). The
Cloudflare Pages build must stay pure Node; `public/img/` is committed output,
regenerated and re-committed by hand whenever `source-photos/portraits/`
changes.

## Content

Everything editable lives in `src/content/` (YAML + Markdown, both languages
side by side in most files) — see BUILD.md §3 for the schema. Adding a concert
is a YAML edit, not a code change: agenda entries carry an ISO `date` and the
page splits upcoming from recent itself, while the home page derives its "next
appearance" block from the same data.

Only confirmed, publicly announceable engagements from Career Atlas reach
`agenda.yaml`. Ventures, contacts, fees, the ensemble project and every private
note stay out. Two claims are deliberately not made anywhere on the site, both
flagged unverified in Atlas: the label for the new Liszt record, and "first
period-instrument recording" of the Sonata.

`docs/PENDIENTES.md` is the live list of missing data; `docs/LAUNCH.md` is the
publication plan (Cloudflare Pages + Cloudflare DNS + mailbox at dinahosting).
