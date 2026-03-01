// sets up the game

import { createBoard } from "./board.js";
import { placeUnits } from "./unitsView.js";
import { showHoverAt } from "./hoverView.js";
import { updateObstacle } from "./movement.js";
import { showUnitInfo } from "./unitStatsUI.js";

export function initGame(state, ui) {
  createBoard(state, ui.boardEl, state.board.rows, state.board.cols);
  placeUnits(state, ui, state.units);
  updateObstacle(state);

  // Setting the hover to friendly unit

  const firstUnit = state.units.find((unit) => {
    return unit.affiliation === 0;
  });

  showHoverAt(state, ui, firstUnit.row, firstUnit.col);
  showUnitInfo(state, ui);
  ui.boardEl.focus();
}
