// player combat controls

import { tileAt } from "./board.js";
import { attackAnimation } from "./animations.js";
import { showStats } from "./unitStatsUI.js";

export function attack(attackingUnit, receivingUnit, ui) {
  // check if attack will hit
  // if hit then check if crit

  let randomHitInt = Math.floor(Math.random() * 100 + 1);
  let randomCritInt = Math.floor(Math.random() * 100 + 1);
  let hitChance = attackingUnit.hitRate - receivingUnit.avoidRate;

  console.log(hitChance, randomHitInt, randomCritInt);

  if (!receivingUnit) return false;

  if (randomHitInt <= hitChance) {
    if (randomCritInt <= attackingUnit.critRate) {
      attackingUnit.attackPlayer(receivingUnit, "Crit");
      attackAnimation(attackingUnit, "Crit");
      showStats(ui, receivingUnit);
      return "Crit";
    } else {
      attackingUnit.attackPlayer(receivingUnit, "Hit");
      attackAnimation(attackingUnit, "Hit");
      showStats(ui, receivingUnit);
      return "Hit";
    }
  } else {
    attackAnimation(attackingUnit, "Miss");
    showStats(ui, receivingUnit);
    return "Miss";
  }
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
