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
  [Phase.PLAYER_ACTION]: createGate(),
  [Phase.PLAYER_ATTACK]: createGate(),
  [Phase.PLAYER_MOVE]: createGate(),
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
preloadImage("assets/weapons/runeRapier.png");

// initUIControls(ui);
activateDialogueControls(state, ui, gates);
skillListControls(ui, state, gates);
itemListControls(ui, state, gates);
activateBoardInput(state, ui, gates);
activateActionbarInput(state, ui);
activateGlobalInput(state, ui, gates);

runGame(state, ui, gates);

// leveling, weapon triangle, saves,

// Refactor: Tons of redunancy and bad logic

// TODO Immediately:

// the description box doesnt auto scroll
// color blind mode
// menu option that shows stats
//  Environmental tiles that have effects on characters that move onto them (both beneficial and detrimental ones)
// • Having type advantages (Weaknesses to range vs melee attacks, magic resistances of certain spells, etc)
// • UI polishing - having a menu available mid game (in case someone forgets controls, if the game is to become longer), ability to change control scheme (This would probably be a stretch goal and not an immediate thing to worry for), different troop types, different equipment, merchants/shops,

// Can add animation on description box and such to make it feel more dynamic

// Add Archer Class

// Optimize and Organize Code Logic

// BUG LIST:
