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
