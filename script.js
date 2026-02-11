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

// buttons for the action bar is screwed up

// bug where when friendly unit dies the game freaks out

// messy code need to refactor

// Add Skills, log box, 2 more clases, need to update ai to use items, abilities and such

// BUG: when attacking and pressing x to back, it will make a mistake on the state

// figure out a way to add item and ability descriptions

// BUG: cant add player_item conditional figure out

// requires enemy unit to have skills and items otherwise bug

// bug, you can click skill and items if there's none and it screws up the phases, must add conditionals
