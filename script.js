// main file

import { createInitialState, Phase } from "./state.js";
import { createUI } from "./ui.js";
import { createGate } from "./gates.js";
import { runGame } from "./runGame.js";
import { initUIControls } from "./uiControls.js";
import { activateBoardInput } from "./boardInput.js";
import { activateActionbarInput } from "./actionbarInput.js";
import { activateGlobalInput } from "./globalInput.js";
import { itemListControls } from "./itemListControls.js";
import { skillListControls } from "./skillListControls.js";

export const state = createInitialState();
export const ui = createUI();

export const gates = {
  [Phase.MENU]: createGate(),
  [Phase.PLAYER_SELECT]: createGate(),
  [Phase.PLAYER_ATTACK]: createGate(),
  [Phase.PLAYER_ACTION]: createGate(),
  [Phase.PLAYER_SKILL]: createGate(),
  [Phase.PLAYER_ITEM]: createGate(),
  [Phase.ENEMY_TURN]: createGate(),
};

initUIControls(ui);
skillListControls(ui, state, gates);
itemListControls(ui, state, gates);
activateBoardInput(state, ui, gates);
activateActionbarInput(state, ui);
activateGlobalInput(state, ui, gates);

runGame(state, ui, gates);

// leveling, weapon triangle, objectives, classes,  skills, saves, log

// Refactor: Tons of redunancy and bad logic

// TODO Immediately:
// 1. Added Ranger and Wizard Class

// BUG LIST:
// 1. Unit freaks out when they die sometimes
// 2. Action bar buttons dont go left and right in order properly
// 3. Backing from actions such as attack messes with the phases
// 4. Unit requires items or skills otherwise the game bugs.
// 5. Offensive skills do not check for adjacent. (Future bug fix)
