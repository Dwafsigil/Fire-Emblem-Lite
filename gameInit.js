// sets up the game

import { createBoard } from "./board.js";
import { placeUnits } from "./unitsView.js";
import { showHoverAt } from "./hoverView.js";
import { updateObstacle } from "./movement.js";

export function initGame(state, ui) {
  createBoard(state, ui.boardEl, state.board.rows, state.board.cols);
  placeUnits(state, ui, state.units);
  updateObstacle(state);

  showHoverAt(state, ui, 0, 0);
  ui.boardEl.focus();
}
