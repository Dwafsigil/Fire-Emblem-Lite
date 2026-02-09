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

export const state = createInitialState();
export const ui = createUI();

export const gates = {
  [Phase.MENU]: createGate(),
  [Phase.PLAYER_SELECT]: createGate(),
  [Phase.PLAYER_ACTION]: createGate(),
  [Phase.ENEMY_TURN]: createGate(),
};

initUIControls(ui);
itemListControls(ui, state, gates);
activateBoardInput(state, ui, gates);
activateActionbarInput(state, ui);
activateGlobalInput(state, ui, gates);

runGame(state, ui, gates);

// leveling, weapon triangle, terrain bonus, objectives, classes,  skills, saves, log

// can refactor a bunch of code into functions and optimize logic

// buttons for the action bar is screwed up

// add combat stats such as hit, crit, avoid

// bug where when friendly unit dies the game freaks out
