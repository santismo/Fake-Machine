# Fakebot 2

Fakebot 2 keeps the full original Fakebot app while presenting it through a minimal, mobile-first shell.

## Files

- `index.html` — small entry page and semantic shell only.
- `mobile.css` — mobile shell layout, safe-area handling, compact top bar, iframe sizing, and bottom quick dock.
- `shell.js` — loads the original app, injects Fakebot 2 modules, and wires shell buttons to original Fakebot controls.
- `mobile-enhancements.js` — runs inside the original app frame, removes duplicate navigation, hides inactive mode controls, tucks away secondary actions, and makes the existing UI touch-friendly.
- `fretstep-sample-engine.js` — patches the exposed public `AudioKit` methods so Fakebot 2 can route playback through the same `smplr`/FluidR3 GM and drum-machine sample path used by FretStep, with lightweight generated fallbacks.

## Design rule

Do not replace the original Fakebot feature set. Fakebot 2 should refactor, enhance, and route audio differently while preserving the original generation, game, training, chord, song, BIAB, MIDI, piano, fretboard, and settings features.

## Mobile behavior

- The shell keeps six primary actions within thumb reach.
- Only controls relevant to the active progression mode remain visible.
- Secondary header actions live under **More controls**.
- Sound controls stay hidden until the shell's **sounds** button opens them.
- Advanced control groups start collapsed.
