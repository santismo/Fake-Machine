# Fakebot 2

Fakebot 2 keeps the full original Fakebot app while moving the second-page wrapper into a modular mobile-first structure.

## Files

- `index.html` — small entry page and semantic shell only.
- `mobile.css` — mobile shell layout, safe-area handling, top bar, iframe sizing, and bottom quick dock.
- `shell.js` — loads the original app, injects Fakebot 2 modules, and wires shell buttons to original Fakebot controls.
- `mobile-enhancements.js` — runs inside the original app frame and makes the existing UI more touch-friendly on phones.
- `fretstep-sample-engine.js` — patches the original `AudioKit` methods so Fakebot 2 can route playback through FretStep-style sample instruments.

## Design rule

Do not replace the original Fakebot feature set. Fakebot 2 should refactor, enhance, and route audio differently while preserving the original generation, game, training, chord, song, BIAB, MIDI, piano, fretboard, and settings features.
