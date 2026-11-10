import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, game, character, audio, css, controls] = await Promise.all([
  readFile(new URL("../index.php", import.meta.url), "utf8"),
  readFile(new URL("../js/game.js", import.meta.url), "utf8"),
  readFile(new URL("../js/character.js", import.meta.url), "utf8"),
  readFile(new URL("../js/audio.js", import.meta.url), "utf8"),
  readFile(new URL("../css/game.css", import.meta.url), "utf8"),
  readFile(new URL("../docs/CONTROLS_FA.md", import.meta.url), "utf8"),
]);

assert.match(html, /<html lang="fa" dir="rtl">/, "The game shell must be Persian and RTL");
assert.match(html, /id="world"/, "The render root must exist");
assert.match(html, /id="startBtn"/, "The start button must exist");
assert.match(html, /id="helpToggle"/, "The in-game guide button must exist");
assert.match(html, /id="helpDialog"/, "The in-game guide dialog must exist");
assert.match(html, /src="js\/game\.js"/, "The game module must be loaded");

for (const id of ["world", "startBtn", "helpToggle", "helpDialog", "audioToggle", "voicePanel", "modelPanel", "mode", "toast", "prompt"]) {
  assert.ok(html.includes(`id="${id}"`), `Missing required DOM element: ${id}`);
  assert.ok(game.includes(`#${id}`) || id === "world", `Game module does not reference required element: ${id}`);
}

assert.match(game, /from "\.\/character\.js"/, "Character module import missing");
assert.match(game, /from "\.\/audio\.js"/, "Audio module import missing");
assert.match(game, /function carCollidesAt/, "Vehicle/building collision guard missing");
assert.match(game, /window\.addEventListener\("blur",\(\)=>keys\.clear\(\)\)/, "Keys must reset when the window loses focus");
assert.match(character, /loadModelFile\(file\)/, "Local GLB loading must remain available");
assert.match(audio, /footstepBuffer/, "Footstep effect must have a generated buffer");
assert.match(audio, /setEngine\(/, "Engine audio controller missing");
assert.match(css, /\.help-dialog/, "Guide styles missing");
for (const key of ["W A S D", "Space", "Shift", "E", "1", "4"]) {
  assert.ok(controls.includes(key), `Controls guide missing key documentation: ${key}`);
}
console.log("GAME GTA smoke checks passed.");
