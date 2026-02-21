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
import { preloadSprites, preloadImage } from "./preload.js";
import { activateDialogueControls } from "./dialogue.js";

export const state = createInitialState();
export const ui = createUI();

export const gates = {
  [Phase.MENU]: createGate(),
  [Phase.DIALOGUE]: createGate(),
  [Phase.PLAYER_SELECT]: createGate(),
  [Phase.PLAYER_ATTACK]: createGate(),
  [Phase.PLAYER_ACTION]: createGate(),
  [Phase.PLAYER_SKILL]: createGate(),
  [Phase.PLAYER_ITEM]: createGate(),
  [Phase.ENEMY_TURN]: createGate(),
};

preloadSprites("knight_1");
preloadSprites("knight_2");
preloadSprites("wizard_1");
preloadSprites("wizard_2");

preloadImage("assets/queen/aggression.png");
preloadImage("assets/queen/calm.png");
preloadImage("assets/queen/sadness.png");
preloadImage("assets/queen/smile.png");
preloadImage("assets/queen/special.png");
preloadImage("assets/queen/talk.png");

initUIControls(ui);
activateDialogueControls(ui, gates);
skillListControls(ui, state, gates);
itemListControls(ui, state, gates);
activateBoardInput(state, ui, gates);
activateActionbarInput(state, ui);
activateGlobalInput(state, ui, gates);

runGame(state, ui, gates);

// leveling, weapon triangle, saves,

// Refactor: Tons of redunancy and bad logic

// TODO Immediately:
// Allow to hit x to back
// Add all the animations in
// Want the units to be in the background of the dialogue
// Optimize and Organize Code Logic

// BUG LIST:
// 2. Action bar buttons dont go left and right in order properly
// 3. Backing from actions such as attack messes with the phases
// 4. Unit requires items or skills otherwise the game bugs.
// 5. Offensive skills do not check for adjacent. (Future bug fix)
// 6. Flashing animation for the new ones
