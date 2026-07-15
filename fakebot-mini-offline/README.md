# Fakebot Mini Offline

Fakebot Mini Offline is a self-contained version of Fakebot Mini designed to run without an internet connection after the repository has been copied to the device.

Live page: [santismo.github.io/fakebot/fakebot-mini-offline/](https://santismo.github.io/fakebot/fakebot-mini-offline/)

## Offline design

- Chord generation, editing, playback, piano/fret views, examples, game mode, local storage, and local MIDI-file import work without network requests.
- Playback uses Fakebot's built-in Web Audio keys, bass, and drum presets. It does not download `smplr`, SoundFonts, or sample packs.
- The online iReal and Miditar libraries are intentionally unavailable. MIDI files already saved on the iPhone can be imported from Settings > Local MIDI files.
- The version has its own storage namespace, so its settings and progressions do not overwrite the regular Fakebot Mini state.
- A service worker also caches the GitHub Pages edition after one successful online visit. SPCK does not depend on that cache because it serves the included files directly from the cloned project.

## SPCK Editor setup

1. While connected to the internet, install SPCK Editor and clone `https://github.com/santismo/fakebot.git`.
2. Keep the entire repository on the iPhone. In SPCK, open `fakebot-mini-offline/index.html`.
3. Open the file menu and choose **Launch Default** for that file.
4. Tap the Play/Launch button. SPCK will open the local page in its preview or a browser window.
5. Tap Play once while still online to confirm iPhone audio permission. No audio files are downloaded.
6. Turn on Airplane Mode, return to the same SPCK project, launch `fakebot-mini-offline/index.html`, and use it normally.

When editing in SPCK, an external Safari window does not live-reload. Save the file and refresh Safari manually. SPCK must remain installed and the cloned project must stay on the phone. Do not delete SPCK's app data unless the repository has been backed up.

## Files

- `index.html` — mobile shell and offline/PWA entry point.
- `app.html` — local copy of the Fakebot generator with remote startup requests removed.
- `shell.css` / `shell.js` — safe-area layout and primary action bridge.
- `mini-frame.css` / `mini-ui.js` — focused Mini presentation and settings sheet.
- `miditar-midi.js` — local Standard MIDI parser.
- `offline-engine.js` — zero-download Web Audio routing and offline sound controls.
- `sw.js` / `manifest.webmanifest` — optional GitHub Pages offline cache and install metadata.
