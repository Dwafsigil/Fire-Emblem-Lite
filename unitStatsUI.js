// import the stuff later

import { isOccupied } from "./unitQueries.js";
import { items } from "./items.js";
import { skills } from "./skills.js";

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
      // console.log(hoveredUnit.inventory);
      if (hoveredUnit.inventory.length !== 0) {
        hoveredUnit.inventory.forEach((item, index) => {
          const el = document.createElement("button");
          el.className = item;

          if (item.id === hoveredUnit.equipped) {
            el.style.color = "blue";
          }

          el.dataset.index = index;
          el.dataset.id = item.id;
          el.textContent = items[item.id].name;
          ui.itemList.appendChild(el);
        });
      }

      if (hoveredUnit.skills.length !== 0) {
        hoveredUnit.skills.forEach((skill, index) => {
          // console.log(skill);
          const el = document.createElement("button");
          el.className = skill.id;
          el.dataset.index = index;
          el.dataset.id = skill.id;
          el.textContent = `${skills[skill.id].name} ${skill.uses}/${skills[skill.id].uses}`;
          ui.skillList.appendChild(el);
        });
      }
    }

    showStats(state, ui, hoveredUnit);

    ui.statList.classList.remove("hidden");
  } else {
    ui.statList.classList.add("hidden");
    // removes all children of an element
    ui.skillList.replaceChildren();
    ui.itemList.replaceChildren();
  }
}

export function showStats(state, ui, unit) {
  ui.unitName.textContent = `${unit.name}`;
  ui.unitHealthStat.textContent = `HP: ${unit.health}`;
  if (unit.unitType == "wizard") {
    ui.unitAttackStat.textContent = `INT: ${unit.intelligence}`;
  }
  if (unit.unitType == "knight") {
    ui.unitAttackStat.textContent = `STR: ${unit.strength}`;
  }
  ui.unitDefenseStat.textContent = `DEF: ${unit.defense}`;
  ui.unitMovementStat.textContent = `MOV: ${unit.movement}`;
  ui.unitHitStat.textContent = `HIT: ${unit.hitRate}`;
  ui.unitAvoidStat.textContent = `AVO: ${getAvoidWithTerrain(state, unit)} `;
  ui.unitCritStat.textContent = `CRIT: ${unit.critRate}`;
}

export function removeUnitInfo(ui) {
  ui.statList.classList.add("hidden");
  // removes all children of an element
  ui.skillList.replaceChildren();
  ui.itemList.replaceChildren();
}
