# Everest Final V2

Everest Entertainment — editorial cinema-poster redesign, **V2**.
**Live at [everest-final-v2.vercel.app](https://everest-final-v2.vercel.app)** · GitHub `axy-full/everest-final-v2`.
Forked from `~/Downloads/everest-final-version` (live at everest-final.vercel.app). Originally built from the Claude-Code design handoff in
`design_handoff_everest_site/` (5 `.dc.html` reference files + spec README).

## What changed in V2 — the glass hero

The homepage opens on a **work showcase reel running full-bleed behind a frosted panel**.
Nine textless 16:9 film stills cross-fade (5.6s, slow ken-burns) under a `backdrop-filter`
glass panel that covers the left 54% of the frame, so the reel keeps showing softly through
it as colour and soft form. Line-art mountain marks and a faint ridge sit on the glass.

The display block (`MUMBAI ▲ SINCE 2000` / **EVEREST / ENTERTAINMENT** / *Stories that reach
the summit.* / Explore the collection) is **printed twice and clipped to complementary halves**
of the frame at `--seam`: ink where it lands on the frost, white where it lands on the open
reel — so `EVEREST` straddles the divide as `EVE|REST` (≈45/55 at every width). The two copies
must stay character-for-character identical; the second carries `aria-hidden` + `inert`.

`--seam` is the single control. Below 1100px it slides to 62%; below 900px it goes to 100% and
the frost re-forms as a **band across the foot of the frame** (top 40% plays clear, caption
moves up onto the picture, arrows stay on the glass in ink).

Reel frames live in `assets/reel/` (1760×990 q76, ~200KB each, re-encoded from `assets/art/*-still.jpg`):
Hirkani, Mee Shivajiraje Bhosale Boltoy, Daagdi Chaawl, Chandramukhi, Baapjanma, Naach Ga Ghuma,
Farzand, Premachi Goshta, Gulkand. Only the first is in the HTML; the rest paint from `data-src`
after `load`. The intro section below now reads *25 years, one climb.* so nothing echoes the hero.

**Design language:** white canvas, ink `#0a0a0a`, Everest blue `#0A4DA6` as the sole accent
(`#6FA8FF` on dark). Anton display caps + IBM Plex Mono labels, system Helvetica body.
Thin 1px rules and frames, sharp corners everywhere, film-grain overlay (no blend mode),
black marquee strips, grayscale→color hover posters, letterboxed hero carousel,
scroll-driven fade-ups (`animation-timeline: view()`, degrades to one-shot fades).

## Pages

| Route      | File           | Notes |
|------------|----------------|-------|
| `/`        | `index.html`   | **Glass hero** (9-frame work reel behind a frosted panel), **division deck** (3D flip-card cover-flow, migrated from everest-final.vercel.app), Jallosh band, **launch collage** (mixed-size draggable card row), **IG-post social wall**, values, CTA |
| `/films`   | `films.html`   | 202-poster library (155 handoff posters + 47 films from the V3 artwork delivery), sticky decade filter (All/2020s…60s) with live count, Nataks band |
| `/about`   | `about.html`   | 64vh grayscale hero, journey + founder's note expanders, what-we-do, values, media room |
| `/jallosh` | `jallosh.html` | Black hero with logo, statement box, on-every-screen cells, platform placeholders |
| `/contact` | `contact.html` | mailto-composing form, division chips, 5 help topics, 14-item FAQ accordion |
| `/production` `/syndication` `/digital` `/music` | division pages | The four division deep-dives (verbatim from the live V1 deployment), linked from the home deck's flip-backs |
| `/fast`    | `fast.html`    | Standalone FAST channels page (V3 treatment): 8 channel cards, platform chips, YouTube cross-sell band, Carry-Everest-FAST CTA |

All copy migrated verbatim from the previous deployment (everest-site-nu.vercel.app) via the
handoff. Everything self-hosted in `assets/` (~127MB) — nothing hotlinks the old deployments:

- 155 library posters + 7 wide & 7 tall hero stills + about/founder photos (from `~/Downloads/everest-site`)
- **`assets/art/` — the 100-film client artwork delivery migrated from Everest V3**
  (`~/Downloads/everest-site-v2`, live at everest-v3.vercel.app): card (3:4 box art) / still
  (16:9 textless) / key (16:9 with title lockup) per film. Its index lives at `data/art-data.js`
  (`window.ART`: slug → title, year, Devanagari display title, art paths, `inData` flag marking
  films already covered by the old 155-poster set). The 47 films **without** `inData` are wired
  into the `/films` grid via their card art (Gulkand 2025, Premachi Goshta 2 2025, Naach Ga
  Ghuma 2024, Chandramukhi 2022, Mumbai Pune Mumbai 3, Boyz 2, …) — library now spans 1968–2025.
  Stills/keys are staged for future hero/slate use.
- `assets/yt/` — the watch-grid thumbnails, downloaded from YouTube. Three of the handoff's
  eight videos were deleted on YouTube (`qP5OPfxCcKU`, `FdLjn74JWzY`, `ht4RhEPH_tU`); they were
  replaced with alive tiles from the old site's own curated grid (`N2hEFyXAe0A`, `fywuFgnYYfM`
  new-launch slots, `DRCpiuuuQnw` Baghtos Kay Mujara Kar for the movies-on-demand slot).
- `assets/logos/` — full brand set (Everest color/white/icon, Jallosh logo + banner, 13 YouTube
  channel logos; four of them — Marathi, Hindi Cinema, Bhojpuri, Gujarati — power the home
  page's four-language network strip, the rest are kept as site data).

## Run locally

```bash
python3 serve.py   # http://localhost:4556 — clean URLs + no-store cache headers
```

`vercel.json` has `cleanUrls: true` so extensionless links work identically on Vercel.

## Capture helpers (in `site.js`)

- `?capture` — kills all animation/transitions, forces lazy images eager
- `&top=N` — in capture mode shifts the page via `body { transform: translateY(-N px) }`
  (real scroll paints white in headless screenshots); outside capture mode does a normal scroll
- `&open=N` — opens the Nth accordion item (home divisions / contact FAQ)
- `&slide=N` — parks the hero reel on frame N (0-indexed) for screenshots
- `&lscroll=N` — parks the launch collage at `scrollLeft: N` for screenshots
- `&flip=N` — centres division card N and flips it (screenshots)
- `&xtra` — expands every "Read the full …" block

Headless Chrome gotcha: layout has a ~500px minimum width, so mobile-width screenshots
lay out at 500px and crop — use a real browser/device emulation for mobile proof.

## Structure

- `styles.css` — full design system (tokens, nav/menu, marquee, stats, cells, cards, per-page sections)
- `site.js` — burger menu (scroll-locks body), single-open accordions, expanders, glass-hero reel
  (autoplay off under `prefers-reduced-motion`; the caption fades and swaps at the midpoint of the
  cross-fade so it never runs ahead of the picture), decade filter, contact mailto compose, capture helpers
- Film grid data lives in `films.html` (generated from the handoff's 155-entry array; each card
  carries `data-y` for the decade filter)
