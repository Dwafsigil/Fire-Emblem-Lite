// main file

import { createInitialState, Phase } from "./state.js";
import { createUI } from "./ui.js";
import { createGate } from "./gates.js";

import { initUIControls } from "./uiControls.js";

import { activateBoardInput } from "./boardInput.js";
import { activateActionbarInput } from "./actionbarInput.js";
import { activateGlobalInput } from "./globalInput.js";

export const state = createInitialState();
export const ui = createUI();

export const gates = {
  [Phase.PLAYER_SELECT]: createGate(),
  [Phase.PLAYER_ACTION]: createGate(),
  [Phase.ENEMY_TURN]: createGate(),
};

initUIControls(ui);
activateBoardInput(state, ui, gates);
activateActionbarInput(state, ui, gates);
activateGlobalInput(state, ui, gates);
