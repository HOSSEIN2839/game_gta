# GAME GTA Roadmap

## Phase 1 — Playable foundation
- [x] PHP entry point and desktop game shell
- [x] Expanded 8 × 8 city blockout with wider playable bounds
- [x] Marked roads, sidewalks, roadside trees and a central park
- [x] Procedural pedestrians with simple walking loops
- [x] Additional parked decorative vehicles
- [x] Third-person mouse camera and wheel zoom
- [x] Walk, sprint and jump
- [x] Prototype enter/exit and driving
- [x] GLB model loader, local model selection, skeleton/animation mixer integration (requires user-selected compatible GLB)
- [ ] Bundle a distributable character model after asset licence verification
- [x] Basic player-vs-building collision and jump input handling
- [x] Basic vehicle-vs-building blocking (prototype collision)
- [ ] Full capsule/physics collision and improved vehicle physics
- [ ] Pause menu, sound and settings
- [ ] Combat, vehicle-entry and activity clips validated against selected rig

## Phase 2 — Gameplay
- [ ] NPC pedestrians with idle, walk, flee and combat states (current pedestrians only walk simple loops)
- [ ] Melee combat, health and damage feedback
- [ ] Weapon selection, aiming, projectile collision, ammunition and reload (current R action is visual/audio only)
- [ ] More drivable vehicles and improved handling

## Phase 3 — Character photo import
- [ ] Face photo to 3D head/texture fitting
- [ ] Full-body photo reconstruction
- [ ] GLB export/import and preview
- [ ] Secure upload and consent workflow

## Phase 4 — Save and deploy
- [ ] PHP API and MySQL save slots
- [ ] Secure validation and upload limits
- [ ] Performance and asset optimization
- [ ] Apache deployment guide

The V1.1 beta test candidate uses Three.js from jsDelivr and therefore requires internet access. The current prototype uses Three.js. The GLB loader supports a publisher-hosted CC0 sample and user-selected local GLB files; the sample is fetched at runtime and is not bundled in this repository. Photo-to-3D reconstruction requires a separate specialized pipeline. Use only original or properly licensed assets.