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
- **Nav background (§2 item 8).** v10 is *not* ground truth here — its opaque
  gradients read as chrome over the photo. Current behavior: no background on
  nav at any width; `text-shadow` on `nav a` for legibility (same mechanism
  `.lede` uses everywhere else); the mobile portrait dissolves at its *top*
  edge too (§5's alpha ramp), so nav sits over haze, not a hard photo edge.
  Never offset `.env`'s `top` to clear the nav — that was tried and reverted,
  since it just puts the nav on solid ground (the same opaque-band problem).
  Do not "restore" v10's harder gradients either.
- **Zero client JS** except the video facade (`VideoPoster.astro`, bound on
  `astro:page-load` — not `DOMContentLoaded`, which doesn't refire on
  client-side navigations) and Astro's `<ClientRouter />` itself.

## Commands

```
npm run dev              # dev server, localhost:4321
npm run build             # static build to dist/
npm run preview           # serve the build locally
npm run images             # regenerate public/img/ from source-photos/ (§5)
```

`npm run images` is **manual-only, never part of `build`** — it needs the
Python venv at `.venv` (`pip install -r scripts/requirements.txt`). The
Cloudflare Pages build must stay pure Node; `public/img/` is committed output,
regenerated and re-committed by hand whenever `source-photos/portraits/`
changes.

## Content

Everything editable lives in `src/content/` (YAML + Markdown, both languages
side by side in most files) — see BUILD.md §3 for the schema. Adding a concert
is a YAML edit, not a code change.
