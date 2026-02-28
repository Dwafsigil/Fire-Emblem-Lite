// main file

import { createInitialState, Phase } from "./state.js";
import { createUI } from "./ui.js";
import { createGate } from "./gates.js";
import { runGame } from "./runGame.js";
// import { initUIControls } from "./uiControls.js";
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
preloadImage("assets/potions/potions1.png");
preloadImage("assets/weapons/bronzeSword.png");

// initUIControls(ui);
activateDialogueControls(ui, gates);
skillListControls(ui, state, gates);
itemListControls(ui, state, gates);
activateBoardInput(state, ui, gates);
activateActionbarInput(state, ui);
activateGlobalInput(state, ui, gates);

runGame(state, ui, gates);

// leveling, weapon triangle, saves,

// maybe a little burnt out?

// Refactor: Tons of redunancy and bad logic

// TODO Immediately:

// Optimize and Organize Code Logic

// BUG LIST:
// Mouse clicking destroys the controls of the game
