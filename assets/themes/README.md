# Themes

The homepage has one body of content (`index.html`) and many looks. A theme is a
single CSS file in this folder that restyles that content. A random theme opens
the page on every visit; visitors switch themes from the button in the
bottom-right corner, and `#theme=<id>` in the address pins one.

`plain.css` is the smallest example, `night.css` a complete one and
`sheet.css` the most involved (the page becomes a spreadsheet grid).

## How a theme is put together

1. `index.html` holds the catalog `window.HOMEPAGE_THEMES`: one line per theme
   with its `id`, `name`, `note` (shown under the miniature in the switcher) and
   the font keys it uses. Everything else about a theme lives in its CSS file.
   There is no portrait in the page.
2. `assets/styles/base.css` applies to every theme: token fallbacks, a light reset,
   a readable skeleton, the theme switcher and the switch animation.
3. `assets/app.js` loads `assets/themes/<id>.css` and that theme's fonts on demand,
   so a visitor only downloads the theme they are looking at. The other
   stylesheets are fetched quietly once the page is up, and each theme's fonts
   when the visitor points at it in the switcher. The switcher shows a small
   picture of every theme (`images/themes/<id>.webp`, see below).
4. Switching uses the View Transitions API where available: the new theme sweeps
   in as a circle from the chosen swatch. Older browsers get a quick fade.

## Structure of the content

```
body
├─ a.skip-link
├─ svg.sprite                      icon symbols: #i-mail #i-github #i-scholar #i-rss #i-chat
│                                  #i-terminal #i-award #i-folder #i-grid #i-globe #i-play
│                                  #i-code #i-file #i-palette #i-shuffle #i-check
├─ div.backdrop                    hidden; switch it on for full-screen decoration
│  └─ #particles-js, i.shape.shape-1 … i.shape.shape-3
└─ div.page#main
   ├─ header.hero
   │  ├─ div.hero-text
   │  │  ├─ h1.name                "Mingshuo Cai" + span.name-cn
   │  │  ├─ p.role                 span.study-year + " Master's Student @ Nanjing University"
   │  │  ├─ div.bio                two p (strong, a, span.mark)
   │  │  └─ ul.contact             li > a.contact-link > svg.icon + span
   ├─ main.content
   │  ├─ div.col.col-side
   │  │  ├─ section.block[data-block="news"]
   │  │  │    h2.block-title + ol.news-list > li.news-item > time.news-date + span.news-text
   │  │  └─ section.block[data-block="honors"]
   │  │       h2.block-title + ul.honor-list > li
   │  └─ div.col.col-main
   │     ├─ section.block[data-block="publications"]
   │     └─ section.block[data-block="projects"]       both: h2.block-title + ol.entry-list
   └─ footer.site-footer            p
└─ div.theme-switcher              built by assets/app.js
```

An entry in `ol.entry-list` is `li.entry` containing `p.entry-badge` (add
`is-highlight` for the special one), `h3.entry-title`, an optional
`p.entry-authors`, an optional `p.entry-desc` and `ul.entry-links` whose items are
`a.link` or `span.link.is-disabled`. A `h2.block-title` holds an
`svg.icon.block-icon` and a `span` with the text.

`.page` is a one-column grid (intro, content, footer) and `.content` a grid whose
four sections are direct items, because `.col` is `display: contents`. Place them
with `grid-column`, `grid-row` and `order`, or turn `.col` into a flex column to
get two independently stacked columns. Most themes go further and make
`.hero-text`, `.content` and `.col` transparent as well (`display: contents`), so
that the name, the bio, the sections and so on become items of one grid on
`.page`. Note that a `display: contents` box has no margin of its own.

## Rules for a theme file

1. Tokens go in `[data-theme="<id>"] { … }`. Every other selector starts with
   `html[data-theme="<id>"] `. Never style `html`, `body` or a bare class.
2. Define the tokens: `--bg --fg --muted --accent --accent-2 --surface --border
   --radius --font-body --font-display --font-mono --page-width`, plus
   `color-scheme`. The switcher reads them and exposes `--switcher-*` overrides.
3. Use only fonts from the menu below and add their keys to the catalog line, so
   they are loaded before the theme appears. No `@import`, no external URLs.
4. Keep every piece of content visible and readable. Do not hide a section or
   shorten text to make room; lay the theme out for the content as it is.
5. Work from 360 px to 1920 px wide without horizontal overflow or overlap.
6. Never list `visibility`, `display` or layout properties (width, height, top,
   left, margin, padding) in a `transition`: a delayed `visibility` transition
   keeps a hidden element painted. Nothing animates into place when a theme
   first appears (transitions are held off until its stylesheet has settled),
   but a rule that animates on its own, such as a blinking cursor, should stop
   under `prefers-reduced-motion: reduce`.
7. Never set `transform` on an element that tilts (see "Depth"): the page script
   writes the transform there. Use the `translate` and `scale` properties for a
   hover lift; they compose with the tilt.
8. Under `prefers-reduced-motion: reduce`, stop your animations.
9. Leave `.theme-switcher` alone except for its `--switcher-*` tokens.
10. Reading text needs a contrast of at least 4.5:1 and labels are at least 12 px.
11. Work on narrow screens with the same care: a grid track of the wide layout
    must not survive in the one-column layout (say which column every block
    takes, with selectors at least as specific as the wide ones).
12. Each theme must be recognisable at one glance and clearly different from the
    others: give it a layout, a palette and interface elements of its own.

## Fonts

All fonts are self-hosted in `assets/fonts/` (latin subset) and declared in
`assets/fonts.css`. A weight range belongs to a variable font: one file, any weight.

| Family | Weights |
| --- | --- |
| Abril Fatface | 400 |
| Archivo | 100–900 |
| Archivo Black | 400 |
| Caveat | 400–700 |
| CMU Sans (Computer Modern) | 400, 700 |
| CMU Serif (Computer Modern) | 400, 700, italic 400 |
| CMU Typewriter | 400 |
| DM Sans | 100–1000 |
| EB Garamond | 400–800, italic 400–800 |
| IBM Plex Mono | 400, 600 |
| Instrument Serif | 400, italic 400 |
| Inter | 100–900 |
| JetBrains Mono | 100–800 |
| Lato | 400, 700 |
| Lora | 400–700, italic 400–700 |
| Manrope | 200–800 |
| Newsreader | 400–700, italic 400–700 |
| Open Sans | 300–800 |
| Orbitron | 400–900 |
| Outfit | 100–900 |
| Pixelify Sans | 400–700 |
| Press Start 2P | 400 |
| PT Sans | 400, 700 |
| Public Sans | 100–900 |
| Rajdhani | 500, 700 |
| Roboto | 100–900 |
| Space Grotesk | 300–700 |
| VT323 | 400 |

Chinese text falls back to the system fonts of each stack.

## Depth: the 3D tilt

Some themes let cards turn towards the pointer. A theme opts in from its token
block:

```css
[data-theme="night"] { --tilt: '.hero, .entry'; --tilt-strength: 3.2; --tilt-perspective: 900px; }
```

`--tilt` is a quoted selector list; `--tilt-strength` is the largest rotation in
degrees (default 6) and may be set per element, e.g. a calmer value on a big
intro than on a small card; `--tilt-perspective` defaults to 1000px.

While the pointer is over one of those elements, `assets/app.js` eases the
rotation itself and writes the transform inline (so the theme's own
`transition` can never turn the smooth return into a jump), adds the class
`is-tilting` for the time of the hover, and updates four custom properties on
the element for the theme to use:

| Property | Meaning |
| --- | --- |
| `--rx`, `--ry` | current rotation around the x and y axis, in degrees |
| `--px`, `--py` | pointer position, in percent of the element's width and height |

The usual companion is a glare or a spotlight behind the text:

```css
html[data-theme="glass"] .block::after {
    content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
    background: radial-gradient(520px circle at var(--px, 50%) var(--py, 30%), rgba(255, 255, 255, 0.9), transparent 64%);
    opacity: 0; pointer-events: none; transition: opacity 0.6s ease;
}
html[data-theme="glass"] .block.is-tilting::after { opacity: 1; }
```

`z-index: -1` puts the light above the card's background and below its text
(the tilting element is its own stacking context). Keep such layers inside the
element (`inset: 0`), or within the margin beside the page: anything that hangs
out of the viewport widens the page on a phone.

The tilt is off on touch screens and under reduced motion, so nothing may
depend on it: the page must be complete without it. A tilt element that is
scrolled stops tilting. Large angles on large panels blur text while they turn;
2–3 degrees is plenty there, 4–6 on a small card.

Add depth only where the theme gains from it (glass, a dark page, tiles, a
timeline, a slide deck, a HUD) and leave print-like themes flat.

## The entrance

When the page is first shown, `base.css` plays one entrance: `.page` fades in,
then `.hero` and each `.block` rise a few pixels, staggered by a quarter second
at most. `index.html` holds the class `theme-enter` for the first 2.4 seconds
only, so the entrance never replays on a theme switch, and it is skipped under
reduced motion. A theme may hang its own entrance on `html.js.theme-enter` as
well, within that time. If a theme keeps fixed or sticky elements inside
`.hero` or `.block`, or needs those containers free of an animation, opt out:

```css
html.js.theme-enter[data-theme="retro"] .hero,
html.js.theme-enter[data-theme="retro"] .block { animation: none; }
```

## Miniatures of the switcher

`images/themes/<id>.webp` is a 256 × 192 picture of the top of the page in that
theme (the top of the page at 1024 × 768, reduced), made by `tools/thumbs.py`
from the workspace (it needs the local preview server):

```
python3 tools/thumbs.py            # every theme, or: python3 tools/thumbs.py night glass
```

The switcher asks for them when the visitor reaches for its button, and a tile
only loads its picture as it scrolls into view; until then a CSS sketch in the
theme's own colours stands in. Run the tool again whenever a theme's top changes.

## Adding a theme

1. Create `assets/themes/<id>.css` following the rules above.
2. Add a line to `window.HOMEPAGE_THEMES` in `index.html`.
3. If it needs a font that is not there yet, add the file to `assets/fonts/`, a
   rule to `assets/fonts.css` and its key to `window.HOMEPAGE_FONT_FILES`.
4. Make its miniature: `python3 tools/thumbs.py <id>`.

Check it with `index.html#theme=<id>` on a phone-sized window and a desktop one,
then run the checks of the workspace (`tools/check_css.py`, `tools/audit.mjs`,
`tools/review.py <id>`, `tools/flow.mjs`).
