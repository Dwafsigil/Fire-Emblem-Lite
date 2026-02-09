// import the stuff later

import { isOccupied } from "./unitQueries.js";
import { items } from "./items.js";

import { unitAt } from "./unitQueries.js";
import { getAvoidWithTerrain } from "./terrainInfo.js";
export function showUnitInfo(state, ui) {
  // TURN INTO A FUNCTION LATER UPDATES UNIT STATS + POPULATE ITEM LIST

  if (
    isOccupied(state.units, state.hover.row, state.hover.col) ||
    state.playerSelected
  ) {
    const hoveredUnit =
      unitAt(state.units, state.hover.row, state.hover.col) ||
      state.selectedUnit;

    if (!state.playerSelected) {
      hoveredUnit.inventory.forEach((item, index) => {
        const el = document.createElement("button");
        el.className = item;
        el.dataset.index = index;
        el.dataset.id = item.id;
        el.textContent = items[item.id].name;
        ui.itemList.appendChild(el);
      });
    }

    showStats(state, ui, hoveredUnit);

    ui.statList.classList.remove("hidden");
  } else {
    ui.statList.classList.add("hidden");
    // removes all children of an element
    ui.itemList.replaceChildren();
  }
}

export function showStats(state, ui, unit) {
  ui.unitName.textContent = `${unit.name}`;
  ui.unitHealthStat.textContent = `HP: ${unit.health}`;
  ui.unitAttackStat.textContent = `ATK: ${unit.strength}`;
  ui.unitDefenseStat.textContent = `DEF: ${unit.defense}`;
  ui.unitMovementStat.textContent = `MOV: ${unit.movement}`;
  ui.unitHitStat.textContent = `HIT: ${unit.hitRate}`;
  ui.unitAvoidStat.textContent = `AVO: ${getAvoidWithTerrain(state, unit)} `;
  ui.unitCritStat.textContent = `CRIT: ${unit.critRate}`;
}
