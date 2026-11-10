# Character asset source

## Gobkit — OfficeWorker
- Model: https://gobkit.com/freebies/human015/OfficeWorker.glb
- Manifest: https://gobkit.com/api/free
- Format: GLB, rigged humanoid, low-poly
- Clips declared in the manifest: Idle, Walk, Run, Death, Hit, Attack, Special (30 FPS)
- Licence declared by the source manifest: CC0 1.0, public domain, no attribution required.
- The sample is loaded from its publisher's host at runtime; it is not bundled in this repository. Internet access is required for this sample.
- The in-game GLB selector also accepts a locally supplied .glb file. A file with additional clips is needed for dedicated jump, crouch, firearm, vehicle-entry/exit and richer activity animations.

Do not assume that every action exists in every GLB. The game maps available clip names and falls back to the prototype movement when a clip is missing.
