# TOM FORD — LOST CHERRY

A single-page fragrance concept for private review. The approved mockups and source media are in `LOST_CHERRY_FINAL_CODEX_PACKAGE`.

## Local preview

With Node.js installed, run the preview server from the project root.

```powershell
node scripts/serve.mjs
```

Open `http://localhost:4173`. To preview on an iPhone on the same network, add `--lan` and use the network URL printed by the server. The server supports byte ranges for local video playback.

## Source layout

- `index.html` contains the semantic page, the five scroll sections and the loading overlay.
- `styles/base.css` defines fonts, shared tokens and common blocks. `styles/scenes.css` holds the section layouts. `styles/motion.css` holds entrance and reduced-motion styles.
- `scripts/main.js` connects the film, scene reveals, drop and Character modules. JavaScript uses data attributes for section-level hooks and BEM modifiers for visual states.
- `assets/` contains the prepared WebP images, the muted film and the locally hosted fonts with their licenses.

The site uses browser-native HTML, CSS and JavaScript. There is no install or build step.

## Photography

The four scene plates were rebuilt with the built-in image generator using the approved mockups as composition references. The prompt kept the near-black burgundy lighting, subject placement and reflections, requested crisp photographic detail, and removed the interface text. Origin keeps the wet cherry on the right, Essence keeps the cut fruit and hanging bead, and Character and Discover keep the front and three-quarter bottle views with the original label wording.

The generated plates were 1672 × 941. The desktop WebP variants are 1920 × 1080 and 3840 × 2160 exports, and phones get separate crops. The Hero poster is an enlarged frame from the existing film.
