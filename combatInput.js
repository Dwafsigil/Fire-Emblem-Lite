// player combat controls

import { tileAt } from "./board.js";
import { attackAnimation } from "./animations.js";
import { showStats } from "./unitStatsUI.js";
import { playAndRemove } from "./helpers.js";
import { getAvoidWithTerrain, terrainBonus } from "./terrainInfo.js";

export function attack(attackingUnit, receivingUnit, state, ui) {
  // check if attack will hit
  // if hit then check if crit

  let randomHitInt = Math.floor(Math.random() * 100 + 1);
  let randomCritInt = Math.floor(Math.random() * 100 + 1);
  let hitChance =
    attackingUnit.hitRate - getAvoidWithTerrain(state, receivingUnit);

  // console.log(hitChance, randomHitInt, randomCritInt);

  if (!receivingUnit) return false;

  if (randomHitInt <= hitChance) {
    if (randomCritInt <= attackingUnit.critRate) {
      const damage = attackingUnit.attackPlayer(receivingUnit, "Crit");
      attackAnimation(attackingUnit, "Crit");
      showStats(state, ui, receivingUnit);

      const floatingValue = document.createElement("div");
      floatingValue.classList.add("floating-value");

      floatingValue.textContent = `${damage}`;
      floatingValue.style.setProperty("--float-color", "red");

      receivingUnit.node.appendChild(floatingValue);
      playAndRemove(floatingValue);

      return "Crit";
    } else {
      const damage = attackingUnit.attackPlayer(receivingUnit, "Hit");
      attackAnimation(attackingUnit, "Hit");
      showStats(state, ui, receivingUnit);

      const floatingValue = document.createElement("div");
      floatingValue.classList.add("floating-value");

      floatingValue.textContent = `${damage}`;
      floatingValue.style.setProperty("--float-color", "red");

      // console.log(receivingUnit);
      receivingUnit.node.appendChild(floatingValue);
      playAndRemove(floatingValue);

      // console.log(receivingUnit);
      return "Hit";
    }
  } else {
    attackAnimation(attackingUnit, "Miss");
    showStats(state, ui, receivingUnit);

    const floatingValue = document.createElement("div");
    floatingValue.classList.add("floating-value");

    floatingValue.textContent = `Miss!`;
    floatingValue.style.setProperty("--float-color", "white");

    receivingUnit.node.appendChild(floatingValue);
    playAndRemove(floatingValue);

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
