// player combat controls

import { tileAt } from "./board.js";
import { attackAnimation } from "./animations.js";

export function attack(state) {
  state.selectedUnit.attackPlayer(state.receivingUnit);
  // consoleContent += `\n${state.selectedUnit.name} attacked ${state.receivingUnit.name} `;
  // consoleTextField.textContent = consoleContent;
  // let tempUnit = state.selectedUnit;
  if (!state.receivingUnit) return false;

  attackAnimation(state.selectedUnit);
  // state.selectedUnit.node.classList.remove("attack");
  // state.selectedUnit.attackPlayer(state.receivingUnit);
}

export function attackedUnit(state, r, c) {
  let matches;
  matches = state.units.filter(
    (u) => u.row === r && u.col === c && u.affiliation === 1,
  );
  state.receivingUnit = matches[0];

  // state.selectedUnit.attackPlayer(state.receivingUnit);
}

// ✅
export function attackHighlight(state, ui) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dR, dC] of directions) {
    const newRow = state.selectedUnit.row + dR;
    const newCol = state.selectedUnit.col + dC;
    if (tileAt(ui.boardEl, newRow, newCol) !== null)
      tileAt(ui.boardEl, newRow, newCol).classList.add("attack");
  }
}

export function removeAttackHighlight(state, ui) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dR, dC] of directions) {
    const newRow = state.selectedUnit.row + dR;
    const newCol = state.selectedUnit.col + dC;
    if (tileAt(ui.boardEl, newRow, newCol) !== null)
      tileAt(ui.boardEl, newRow, newCol).classList.remove("attack");
  }
}

export function confirmHighlight(ui, r, c) {
  tileAt(ui.boardEl, r, c).classList.add("attack-confirm");
}

export function removeConfirmHiglight(state, ui) {
  if (!state.receivingUnit) return false;
  tileAt(
    ui.boardEl,
    state.receivingUnit.row,
    state.receivingUnit.col,
  ).classList.remove("attack-confirm");
}
