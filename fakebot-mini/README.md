# Fakebot Mini

Fakebot Mini is a focused, mobile-first presentation of Fakebot's existing chord-generation engine.

Live page: https://santismo.github.io/fakebot/fakebot-mini/

## Product boundary

- The original Fakebot generator remains the music brain.
- Generate, playback scheduling, voicing, chord rules, history, editing, MIDI, scale analysis, and active-chord state are preserved.
- The visible experience is rebuilt around Generate, a tall two-octave piano, centered chord cards, and a single organized settings sheet.
- Example, game, song, timing, feel, and chord-limiter controls live behind Settings.
- BIAB upload, theme selection, morphing gradients, legacy SoundFont controls, and synthetic instrument controls are not part of the Mini interface.
- Playback uses only FretStep's `smplr`/FluidR3 GM and sampled drum-machine path. Sample failures remain silent and offer Retry; Mini never falls back to oscillator voices.

## Files

- `index.html` — standalone GitHub Pages route and accessible shell.
- `shell.css` — fixed top bar, thumb-reachable primary actions, and safe-area layout.
- `shell.js` — loads the Fakebot brain, injects Mini modules, and bridges Generate, Play, and Settings.
- `mini-frame.css` — neutral, gradient-free visual system for the reimagined app.
- `mini-ui.js` — reorganizes the existing Fakebot controls without cloning its generation logic.
- `sample-engine.js` — sample-only shared-context audio backend using FretStep's selected instrument path.
