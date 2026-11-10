# GAME GTA

Single-player third-person 3D open-world browser game inspired by the classic GTA era. All game assets will be original or properly licensed.

## Run on XAMPP
1. Copy this folder into C:\xampp\htdocs\game_gta.
2. Start Apache.
3. Open http://localhost/game_gta/ in a desktop browser.
4. Press Start game and click the game view to capture the mouse.

Three.js currently loads from jsDelivr, so internet access is required. A local vendor copy will be added for offline hosting.

## Player character
- After starting, use the Player Model panel to load the publisher-hosted CC0 sample (internet required), or select your own rigged .glb file.
- Embedded animation clips are detected and mapped by their names. The sample includes Idle, Walk, Run, Death, Hit, Attack and Special; it does not include dedicated crouch, jump, firearm or vehicle-entry clips.
- The sample is fetched from Gobkit at runtime and is not bundled in this repository.

## Audio and player voice
- Use the Sound button to mute/unmute.
- After starting, load recordings in the Player Voice panel for keys 1–4. Files are loaded locally in the browser session and are not uploaded to GitHub.
- Licensed sample files can be loaded from `assets/audio/`; see `docs/ASSET_SOURCES.md`. Production-quality sound packs still need to be downloaded, licence-checked and added before calling the audio final.

## Controls
- W/A/S/D: move and drive
- Shift: sprint
- Space: jump
- Mouse: rotate camera
- Mouse wheel: zoom
- E: enter/exit nearby car
- Esc: release mouse

This is the first playable foundation with procedural placeholder geometry, not a finished game. See docs/ROADMAP.md.