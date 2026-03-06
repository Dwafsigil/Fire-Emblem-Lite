// import the stuff later

import { isOccupied } from "./unitQueries.js";
import { items } from "./items.js";
import { skills } from "./skills.js";

import { unitAt } from "./unitQueries.js";
import { getAvoidWithTerrain } from "./terrainInfo.js";
import { setDisabled } from "./actionbarInput.js";
export function showUnitInfo(state, ui) {
  // TURN INTO A FUNCTION LATER UPDATES UNIT STATS + POPULATE ITEM LIST

  ui.unitNameContent.classList.remove("hidden");
  ui.statList.classList.remove("hidden");

  ui.skillList.replaceChildren();
  ui.itemList.replaceChildren();
  if (state.playerSelected) {
    const unit = state.selectedUnit;

    // show healthbar
    healthBarUI(ui, state.selectedUnit);

    // show selected player inventory
    if (unit.inventory.length !== 0) {
      unit.inventory.forEach((item, index) => {
        const el = document.createElement("button");
        const itemText = document.createElement("span");
        itemText.className = "item-text";

        // el.className = item;

        if (unit.hasAction === false) {
          if (items[item.id].type === "consumable") {
            setDisabled(el, "true");
          }
        }

        itemText.textContent = items[item.id].name;

        el.appendChild(itemText);

        // if it's the item that's equipped
        if (item.id === unit.equipped) {
          const equipIndicator = document.createElement("span");
          // el.style.color = "blue";
          equipIndicator.className = "equip-indicator";
          equipIndicator.textContent = "[E]";

          el.appendChild(equipIndicator);
        }

        el.dataset.index = index;
        el.dataset.id = item.id;
        itemText.textContent = items[item.id].name;

        // el.appendChild(itemText);

        // el.textContent = items[item.id].name;
        ui.itemList.appendChild(el);
      });
    }

    // show selected player skills
    if (unit.skills.length !== 0) {
      unit.skills.forEach((skill, index) => {
        const el = document.createElement("button");
        el.className = skill.id;
        el.dataset.index = index;
        el.dataset.id = skill.id;

        const skillName = document.createElement("span");
        skillName.className = "skill-name";

        const skillUses = document.createElement("span");
        skillUses.className = "skill-uses";

        skillName.textContent = `${skills[skill.id].name}`;
        skillUses.textContent = ` (${skill.uses}/${skills[skill.id].uses})`;

        // el.textContent = `${skills[skill.id].name} ${skill.uses}/${skills[skill.id].uses}`;
        el.appendChild(skillName);
        el.appendChild(skillUses);

        ui.skillList.appendChild(el);
      });
    }

    // show stats
    showStats(state, ui, unit);

    // hovering over units
  } else if (
    isOccupied(state.units, state.hover.row, state.hover.col) &&
    !state.playerSelected
  ) {
    const hoveredUnit = unitAt(state.units, state.hover.row, state.hover.col);

    // health bar
    healthBarUI(ui, hoveredUnit);

    // inventory
    if (hoveredUnit.inventory.length !== 0) {
      hoveredUnit.inventory.forEach((item, index) => {
        const el = document.createElement("button");
        el.className = item;
        const itemText = document.createElement("span");
        itemText.className = "item-text";

        if (hoveredUnit.hasAction === false) {
          if (items[item.id].type === "consumable") {
            setDisabled(el, "true");
          }
        }

        itemText.textContent = items[item.id].name;
        el.appendChild(itemText);

        if (item.id === hoveredUnit.equipped) {
          const equipIndicator = document.createElement("span");
          // el.style.color = "blue";
          equipIndicator.className = "equip-indicator";
          equipIndicator.textContent = "[E]";

          el.appendChild(equipIndicator);
        }

        el.dataset.index = index;
        el.dataset.id = item.id;

        // el.textContent = items[item.id].name;
        ui.itemList.appendChild(el);
      });
    }

    // skills
    if (hoveredUnit.skills.length !== 0) {
      hoveredUnit.skills.forEach((skill, index) => {
        const el = document.createElement("button");
        el.className = skill.id;
        el.dataset.index = index;
        el.dataset.id = skill.id;

        // splitting
        const skillName = document.createElement("span");
        skillName.className = "skill-name";

        const skillUses = document.createElement("span");
        skillUses.className = "skill-uses";

        skillName.textContent = `${skills[skill.id].name}`;
        skillUses.textContent = `(${skill.uses}/${skills[skill.id].uses})`;

        // el.textContent = `${skills[skill.id].name} ${skill.uses}/${skills[skill.id].uses}`;
        el.appendChild(skillName);
        el.appendChild(skillUses);

        ui.skillList.appendChild(el);
      });
    }
    showStats(state, ui, hoveredUnit);
  } else {
    ui.unitNameContent.classList.add("hidden");
    ui.statList.classList.add("hidden");
  }
}

export function showStats(state, ui, unit) {
  ui.unitName.textContent = `${unit.name}`;
  ui.unitClass.textContent = `${unit.unitType}`;
  ui.unitHealthStat.textContent = `${unit.health}/${unit.maxHealth}`;
  if (unit.unitType == "Wizard") {
    ui.unitAttackStat.textContent = `INT: ${unit.intelligence}`;
  }
  if (unit.unitType == "Knight") {
    ui.unitAttackStat.textContent = `STR: ${unit.strength}`;
  }
  ui.unitDefenseStat.textContent = `DEF: ${unit.defense}`;
  ui.unitResistanceStat.textContent = `RES: ${unit.resistance}`;
  ui.unitSkillStat.textContent = `SKL: ${unit.skill}`;
  ui.unitLuckStat.textContent = `LCK: ${unit.luck}`;
  ui.unitSpeedStat.textContent = `SPD: ${unit.speed}`;

  ui.unitMovementStat.textContent = `MOV: ${unit.movement}`;
  ui.unitHitStat.textContent = `HIT: ${Math.floor(unit.hitRate)}`;
  ui.unitAvoidStat.textContent = `AVO: ${Math.floor(getAvoidWithTerrain(state, unit))} `;
  ui.unitCritStat.textContent = `CRIT: ${Math.floor(unit.critRate)}`;

  // Hard coding
  if (unit.equipped) {
    for (const key in items[unit.equipped].bonuses) {
      if (key === "strength") {
        ui.unitAttackStat.style.color = "#84eab3";
      }
      if (key === "defense") {
        ui.unitDefenseStat.style.color = "#84eab3";
      }
      if (key === "resistance") {
        ui.unitResistanceStat.style.color = "#84eab3";
      }
      if (key === "skill") {
        ui.unitSkillStat.style.color = "#84eab3";
      }
      if (key === "luck") {
        ui.unitLuckStat.style.color = "#84eab3";
      }
      if (key === "speed") {
        ui.unitSpeedStat.style.color = "#84eab3";
      }
      if (key === "movement") {
        ui.unitMovementStat.style.color = "#84eab3";
      }
    }
  } else {
    ui.unitAttackStat.style.removeProperty("color");
    ui.unitDefenseStat.style.removeProperty("color");
    ui.unitResistanceStat.style.removeProperty("color");
    ui.unitSkillStat.style.removeProperty("color");
    ui.unitLuckStat.style.removeProperty("color");
    ui.unitSpeedStat.style.removeProperty("color");
    ui.unitMovementStat.style.removeProperty("color");
  }
}

export function healthBarUI(ui, unit) {
  const pct = Math.max(0, Math.min(100, (unit.health / unit.maxHealth) * 100));
  let color;

  if (pct < 33) {
    color = "red";
  } else if (pct < 66) {
    color = "yellow";
  } else {
    color = "#4ade80";
  }

  ui.healthBarFillUI.style.backgroundColor = `${color}`;

  ui.healthBarFillUI.style.width = `${pct}%`;
}

export function removeUnitInfo(ui) {
  ui.statList.classList.add("hidden");
  // removes all children of an element
  ui.skillList.replaceChildren();
  ui.itemList.replaceChildren();
}
