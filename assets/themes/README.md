# Themes

The homepage has one body of content (`index.html`) and many looks. A theme is a
single CSS file in this folder that restyles that content. A random theme opens
the page on every visit; visitors switch themes from the button in the
bottom-right corner, and `#theme=<id>` in the address pins one.

`plain.css` is the smallest example, `night.css` a complete one and
`sheet.css` the most involved (the page becomes a spreadsheet grid).

## How a theme is put together

1. `index.html` holds the catalog `window.HOMEPAGE_THEMES`: one line per theme
   with its `id`, `name`, `note`, the font keys it uses and the portrait it shows.
2. `assets/styles/base.css` applies to every theme: token fallbacks, a light reset,
   a readable skeleton, the theme switcher and the switch animation.
3. `assets/app.js` loads `assets/themes/<id>.css` and that theme's fonts on demand,
   so a visitor only downloads the theme they are looking at. The other
   stylesheets are fetched quietly once the page is up, and each theme's fonts
   when the visitor points at it in the switcher.
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
   │  └─ img.avatar
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
4. Keep every piece of content visible and readable. Only `.avatar` may be hidden.
5. Work from 360 px to 1920 px wide without horizontal overflow or overlap.
6. Never list `visibility`, `display` or layout properties (width, height, top,
   left, margin, padding) in a `transition`: a delayed `visibility` transition
   keeps a hidden element painted. Declare the transition in the `:hover` rule
   only, so that nothing animates into place when the theme first appears.
7. Under `prefers-reduced-motion: reduce`, stop your animations.
8. Leave `.theme-switcher` alone except for its `--switcher-*` tokens.
9. Reading text needs a contrast of at least 4.5:1 and labels are at least 12 px.
10. Each theme must be recognisable at one glance and clearly different from the
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

## Portraits

`images/avatar.webp` is the default: a colourful illustrated portrait, square.
A theme can ask for another rendering of the same picture through the catalog's
`avatar` field: `avatar-pixel.png` (head and shoulders, pixel art),
`avatar-halftone.png` (black and white print dots), `avatar-line.webp` (ink
drawing on a transparent background) and `avatar-duotone-cyan.webp` (two-tone).
`"none"` hides it. The variants were derived from the original illustration with
`tools/make_avatars.py`-style processing (Pillow); the original `photo3.png`
stays in the repository untouched.

## Adding a theme

1. Create `assets/themes/<id>.css` following the rules above.
2. Add a line to `window.HOMEPAGE_THEMES` in `index.html`.
3. If it needs a font that is not there yet, add the file to `assets/fonts/`, a
   rule to `assets/fonts.css` and its key to `window.HOMEPAGE_FONT_FILES`.

Check it with `index.html#theme=<id>` on a phone-sized window and a desktop one.
