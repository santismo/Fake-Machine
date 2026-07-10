# Fakebot Mini

Fakebot Mini is a focused, mobile-first presentation of Fakebot's existing chord-generation engine.

Live page: [santismo.github.io/fakebot/fakebot-mini/](https://santismo.github.io/fakebot/fakebot-mini/)

## Product boundary

- The original Fakebot generator remains the music brain, including its chord rules, voicings, editing, history, scale analysis, and active-chord state.
- The visible experience is rebuilt around icon-only primary actions, centered chord cards, and one organized settings sheet.
- The fretboard is a compact, mobile-friendly 13-fret pad based on Fretizer, with root, scale, and chord tones kept legible.
- Progressions can use 2, 4, or 8 cards per row. Longer progressions stay inside a bounded scrolling panel so the fret display remains visible.
- Scale keys use a darker outlined treatment, the active chord glows, and chords outside the visible key center receive a restrained holographic card treatment.
- Example, game, song, timing, feel, and chord-limiter controls live behind Settings.
- Song mode has two selectable libraries: the existing iReal-style songs and Miditar MIDI-marker charts. Either library can be the source for manual selection or random song choice.
- MIDI charts turn their chord markers into progression cards and keep their original notes and timing; MIDI channels and program changes drive the selected sampled keys, bass, and drums without the backing-band arrangement.
- BIAB upload, theme selection, morphing gradients, legacy SoundFont controls, and synthetic instrument controls are not part of the Mini interface.
- Playback uses only FretStep's `smplr` sample paths, with grouped instrument choices and Randomize Sounds. Mini does not fall back to oscillator voices.
- The scale-count limiter canonicalizes displayed scales and retunes single-scale generations when a generated chord would fall outside the selected scale.

## Files

- `index.html` — standalone GitHub Pages route and accessible shell.
- `shell.css` — thumb-reachable icon actions and safe-area layout without duplicate top chrome.
- `shell.js` — loads the Fakebot brain, injects Mini modules, and bridges Generate, Play, and Settings.
- `mini-frame.css` — neutral visual system with conditional key-center and active-chord states.
- `mini-ui.js` — reorganizes the existing Fakebot controls without cloning its generation logic.
- `miditar-midi.js` — validated Standard MIDI parser for notes, marker events, tempo maps, signatures, channels, and program changes.
- `sample-engine.js` — sample-only shared-context audio backend using FretStep's selected instrument path, including MIDI role routing.
