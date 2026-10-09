# Generative Retrieval, Illustrated

A lightweight interactive guide for a five-minute presentation to engineers new to recommendation systems.

## Run locally

Requires Node.js. No dependency installation or build is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. All deployable files are in `dist/`. Google Fonts is optional; system fonts are used if unavailable.

## Present

Select **Present** in the header to focus on the diagrams. Use the three chapter tabs or the left/right arrow keys to navigate. **Replay** restarts a scene; **Pause** freezes it. The decoder scene also has **Next step** for manual narration. Reduced-motion preferences are respected.

The decoder scene opens in **Beam search** mode: extend valid prefixes, keep up to three paths by cumulative probability, and resolve the three surviving IDs to catalog items. **One path** returns to the original single-item walkthrough. The fixed-width, catalog-constrained search uses illustrative probabilities; beam search is approximate, and may discard paths that would have scored better later.

The **Presenter notes** panel contains a timed five-minute script and a download link. The script is also in `dist/presenter-notes.md`.

## Scope

This is a conceptual animation of a TIGER-style semantic-ID retrieval system, not a trained model. The catalog, semantic codes, relationship strengths, and vector locations are illustrative. Model caveats and primary sources are available under **Sources & model notes**.

## Files

- `dist/index.html`: accessible document structure and core diagrams.
- `dist/styles.css`: responsive layout and animation styling.
- `dist/app.js`: chapter, catalog, playback, keyboard, and notes controls.
- `dist/comparison.js`: three comparison diagrams and their animation.
- `dist/beam-search.js` and `dist/beam-search.css`: staged beam-search tree and responsive round cards.
- `dist/presenter-notes.md`: timed presentation script.
- `server.mjs`: local static preview server.

Syntax checks: `npm run check`.
