// visuals for unis

import { tileAt } from "./board.js";
import { inBounds } from "./board.js";
import { deadAnimation } from "./animations.js";

export function placeUnits(state, ui, units) {
  for (const unit of units) {
    const t = tileAt(ui.boardEl, unit.row, unit.col);
    const el = createPlayerNode(unit);
    t.appendChild(el);
  }
}

export function createPlayerNode(unit) {
  // console.log(unit.variant);
  const el = document.createElement("div");

  el.className = `player ${unit.variant} idle`;
  el.id = `player-${unit.playerId}`;

  // console.log(el);

  const healthBarContainer = document.createElement("div");
  healthBarContainer.classList.add("health-bar-container");

  const healthBarBackground = document.createElement("div");
  healthBarBackground.classList.add("health-bar-background");

  // const healthValue = document.createElement("div");
  // healthValue.classList.add("health-value");
  // healthValue.textContent = "30/40";

  const healthBarFill = document.createElement("div");
  healthBarFill.classList.add("health-bar-fill");
  healthBarFill.style.width = "100%";

  // healthBarContainer.appendChild(healthValue);
  healthBarBackground.appendChild(healthBarFill);
  healthBarContainer.appendChild(healthBarBackground);

  el.appendChild(healthBarContainer);
  // el.appendChild(strengthValue);
  unit.node = el;

  unit.setHealthBar(healthBarFill);
  // unit.setStrength(strengthValue);
  // unit.setHealthValue(healthValue);

  return el;
}

// ✅
export function placePlayer(state, ui, r, c) {
  // console.log("placePlayer");
  if (
    !inBounds(
      state.board.rows,
      state.board.cols,
      state.hover.row,
      state.hover.col,
    )
  )
    return false;
  state.selectedUnit.row = r;
  state.selectedUnit.col = c;
  const t = tileAt(ui.boardEl, r, c);

  t.appendChild(state.selectedUnit.node);
}

export async function removeDead(state, ui, deadUnit) {
  // console.log("Running", deadUnit);
  deadAnimation(deadUnit);

  const el = document.createElement("li");
  el.textContent = `${deadUnit.name} has been slain`;
  ui.combatLog.appendChild(el);

  state.units = state.units.filter((e) => e !== deadUnit);
  let t = tileAt(ui.boardEl, deadUnit.row, deadUnit.col);
  setTimeout(() => {
    t.removeChild(deadUnit.node);
  }, 3000);

  // let tempUnit;
  // if (state.playerTurn == true) {
  //   tempUnit = state.receivingUnit;
  //   deadAnimation(state.receivingUnit);
  //   state.units = state.units.filter((e) => e !== tempUnit);
  //   let t = tileAt(ui.boardEl, tempUnit.row, tempUnit.col);
  //   setTimeout(() => {
  //     t.removeChild(tempUnit.node);
  //   }, 2000);
  // } else {
  //   tempUnit = state.closestFriendly;
  //   deadAnimation(state.closestFriendly);
  //   state.units = state.units.filter((e) => e !== tempUnit);
  //   let t = tileAt(ui.boardEl, tempUnit.row, tempUnit.col);
  //   setTimeout(() => {
  //     t.removeChild(tempUnit.node);
  //   }, 2000);
  // }
}
