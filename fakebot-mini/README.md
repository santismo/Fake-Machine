# Fakebot Mini

Fakebot Mini is a focused, mobile-first presentation of Fakebot's existing chord-generation engine.

Live page: https://santismo.github.io/fakebot/fakebot-mini/

## Product boundary

- The original Fakebot generator remains the music brain.
- Generate, playback scheduling, voicing, chord rules, history, editing, MIDI, scale analysis, and active-chord state are preserved.
- The visible experience is rebuilt around icon-only primary actions, a compact two-octave piano, centered chord cards, and a single organized settings sheet.
- Scale keys use a darker outlined treatment, the active chord glows, and chords outside the visible key center receive a restrained holographic card treatment.
- Example, game, song, timing, feel, and chord-limiter controls live behind Settings.
- BIAB upload, theme selection, morphing gradients, legacy SoundFont controls, and synthetic instrument controls are not part of the Mini interface.
- Playback uses only FretStep's `smplr` sample paths, with grouped GM, electric-piano, mallet, Mellotron, Smolken bass, and drum-machine choices plus Randomize Sounds. Sample failures remain silent and offer Retry; Mini never falls back to oscillator voices.
- The scale-count limiter canonicalizes displayed scales and retunes single-scale generations when a generated chord would fall outside the selected scale.

## Files

- `index.html` — standalone GitHub Pages route and accessible shell.
- `shell.css` — thumb-reachable icon actions and safe-area layout without duplicate top chrome.
- `shell.js` — loads the Fakebot brain, injects Mini modules, and bridges Generate, Play, and Settings.
- `mini-frame.css` — neutral visual system with conditional key-center and active-chord states.
- `mini-ui.js` — reorganizes the existing Fakebot controls without cloning its generation logic.
- `sample-engine.js` — sample-only shared-context audio backend using FretStep's selected instrument path.
