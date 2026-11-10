import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const [html, game, character, audio, animationLibrary, css, controls] = await Promise.all([
  readFile(new URL("../index.php", import.meta.url), "utf8"),
  readFile(new URL("../js/game.js", import.meta.url), "utf8"),
  readFile(new URL("../js/character.js", import.meta.url), "utf8"),
  readFile(new URL("../js/audio.js", import.meta.url), "utf8"),
  readFile(new URL("../js/animation-library.js", import.meta.url), "utf8"),
  readFile(new URL("../css/game.css", import.meta.url), "utf8"),
  readFile(new URL("../docs/CONTROLS_FA.md", import.meta.url), "utf8"),
]);

const characterAssets = [
  "CasualFemale.glb",
  "FormalFemale.glb",
  "CasualMale.glb",
  "SuitMale.glb",
  "HoodieMale.glb",
];
for (const asset of characterAssets) {
  const info = await stat(new URL("../assets/characters/" + asset, import.meta.url));
  assert.ok(info.isFile() && info.size > 100_000, `Missing or implausibly small bundled character asset: ${asset}`);
}
assert.match(html, /assets\/characters/, "Character assets must be loaded from the repository");
assert.match(html, /<html lang="fa" dir="rtl">/, "The game shell must be Persian and RTL");
assert.match(html, /id="world"/, "The render root must exist");
assert.match(html, /id="startBtn"/, "The start button must exist");
assert.match(html, /class="overlay character-select-overlay"/, "Pre-game character selection must exist");
for (const id of ["casual-female","formal-female","casual-male","suit-male","hoodie-male"]) assert.ok(html.includes('data-preset="'+id+'"'), "Missing preset option: "+id);
assert.match(html, /id="characterStatus"/, "Character loading status must exist");
assert.match(html, /id="modelFile"/, "Custom GLB upload must be available before starting");

assert.match(html, /id="helpToggle"/, "The in-game guide button must exist");
assert.match(html, /id="helpDialog"/, "The in-game guide dialog must exist");
assert.match(html, /src="js\/game\.js"/, "The game module must be loaded");

for (const id of ["world", "startBtn", "helpToggle", "helpDialog", "audioToggle", "voicePanel", "modelPanel", "mode", "toast", "prompt"]) {
  assert.ok(html.includes(`id="${id}"`), `Missing required DOM element: ${id}`);
  assert.ok(game.includes(`#${id}`) || id === "world", `Game module does not reference required element: ${id}`);
}

assert.match(game, /from "\.\/character\.js"/, "Character module import missing");
assert.match(game, /characterPresets=/, "Preset character catalog must be present");
assert.match(game, /chooseCharacter\("casual-female"\)/, "A default preset must be loaded before the game starts");
assert.match(game, /assets\/characters\/CasualFemale\.glb/, "Local character asset path must be used");
assert.match(game, /pointermove/, "Character preview must support rotation");

assert.match(game, /from "\.\/audio\.js"/, "Audio module import missing");
assert.match(game, /function carCollidesAt/, "Vehicle/building collision guard missing");
assert.match(game, /window\.addEventListener\("blur",\(\)=>keys\.clear\(\)\)/, "Keys must reset when the window loses focus");
assert.match(character, /loadModelFile\(file\)/, "Local GLB loading must remain available");
assert.match(character, /ensureUniversalAnimations\(/, "Universal animation library must be installed on each rig");
assert.match(animationLibrary, /universal_/, "Shared universal clips must be generated for compatible rigs");
for (const action of ["idle", "walk", "run", "jump", "crouch", "punch", "shoot", "sit", "hit", "death"]) assert.ok(animationLibrary.includes(action + ":"), `Universal animation missing: ${action}`);
assert.match(audio, /footstepBuffer/, "Footstep effect must have a generated buffer");
assert.match(audio, /setEngine\(/, "Engine audio controller missing");
assert.match(css, /\.help-dialog/, "Guide styles missing");
for (const key of ["W", "D", "A", "Space", "Shift", "E", "V", "1", "4"]) {
  assert.ok(controls.includes(key), `Controls guide missing key documentation: ${key}`);
}

assert.match(game, /Array\.from\(\{length:15\}/, "The playable city must use the larger street grid");
assert.match(game, /block\(scene,1040,1,1040,grass/, "The world ground must cover the expanded map");
assert.match(game, /s=\(keys\.has\("KeyD"\)\?1:0\)-\(keys\.has\("KeyA"\)\?1:0\)/, "D must steer right and A must steer left while driving");
assert.match(game, /move\.add\(r\).*move\.sub\(r\)/, "D/A on-foot movement must preserve right/left direction");
assert.match(game, /const pedestrians=\[\]/, "Pedestrian population must be present");
assert.match(game, /for\(const npc of pedestrians\)/, "Pedestrians must be animated");
assert.match(game, /for\(let i=0;i<64;i\+\+\)/, "The expanded pedestrian population must be present");
assert.match(game, /windObjects/, "Wind animation must affect vegetation");
assert.match(game, /KeyG/, "Nearby NPC conversation must be available");
assert.match(character, /this\.weapon=new THREE\.Group\(\)/, "A visible procedural weapon must be available");
assert.match(character, /this\.proceduralActionTime/, "Procedural fallback actions must be animated");
assert.match(character, /loadAnimationFile\(file\)/, "Separate animation upload must be available");
assert.match(character, /attachAnimations\(gltf\.animations\)/, "Separate animation clips must attach to the active character");
assert.match(character, /animateModelBones\(/, "Models without suitable clips must receive procedural bone animation");
assert.match(game, /character\.userModel/, "Re-activate button must preserve and restore the user's uploaded model");
assert.match(html, /id="animationFile"/, "Separate animation file input must exist");
assert.match(html, /نمایش دوباره مدل شخصی بارگذاری‌شده/, "Re-activate button must not replace the uploaded character");
assert.match(audio, /action\(kind\)/, "Combat action sound effects must be available");

console.log("GAME GTA smoke checks passed.");
