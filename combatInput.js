// player combat controls

import { tileAt } from "./board.js";
import { attackAnimation } from "./animations.js";
import { showStats } from "./unitStatsUI.js";
import { playAndRemove } from "./helpers.js";
import { getAvoidWithTerrain, terrainBonus } from "./terrainInfo.js";
import { skills } from "./skills.js";

export function attack(attackingUnit, receivingUnit, skill = null, state, ui) {
  // check if attack will hit
  // if hit then check if crit
  console.log("In attack", skill);

  let randomHitInt = Math.floor(Math.random() * 100 + 1);
  let randomCritInt = Math.floor(Math.random() * 100 + 1);

  let hitChance =
    attackingUnit.hitRate - getAvoidWithTerrain(state, receivingUnit);

  let skillBonus = skill ? skills[skill.dataset.id].bonus : 0;
  let skillSpecial = skill ? skills[skill.dataset.id].special : null;
  console.log(skillBonus);
  if (!receivingUnit) return false;

  if (randomHitInt <= hitChance) {
    if (randomCritInt <= attackingUnit.critRate) {
      const damage = attackingUnit.attackPlayer(
        receivingUnit,
        skillSpecial,
        "Crit",
        skillBonus,
      );
      attackAnimation(attackingUnit, "Crit", skill);
      showStats(state, ui, receivingUnit);

      const floatingValue = document.createElement("div");
      floatingValue.classList.add("floating-value");

      floatingValue.textContent = `${damage}`;
      floatingValue.style.setProperty("--float-color", "red");

      receivingUnit.node.appendChild(floatingValue);
      playAndRemove(floatingValue);

      // battle log
      if (state.useSkill) {
        const skillID = state.useSkill.dataset.id;
        const el = document.createElement("li");
        el.textContent = `${attackingUnit.name} hits a critical ${skills[skillID].name} on ${receivingUnit.name}`;
        ui.combatLog.appendChild(el);
      } else {
        const el = document.createElement("li");
        el.textContent = `${attackingUnit.name} hits a critical on ${receivingUnit.name}`;
        ui.combatLog.appendChild(el);
      }
      return "Crit";
    } else {
      const damage = attackingUnit.attackPlayer(
        receivingUnit,
        skillSpecial,
        "Hit",
        skillBonus,
      );
      attackAnimation(attackingUnit, "Hit", skill);
      showStats(state, ui, receivingUnit);

      const floatingValue = document.createElement("div");
      floatingValue.classList.add("floating-value");

      floatingValue.textContent = `${damage}`;
      floatingValue.style.setProperty("--float-color", "red");

      // console.log(receivingUnit);
      receivingUnit.node.appendChild(floatingValue);
      playAndRemove(floatingValue);

      // battle log

      if (state.useSkill) {
        const skillID = state.useSkill.dataset.id;

        const el = document.createElement("li");
        el.textContent = `${attackingUnit.name} hits ${skills[skillID].name} on ${receivingUnit.name}`;
        ui.combatLog.appendChild(el);
      } else {
        const el = document.createElement("li");
        el.textContent = `${attackingUnit.name} hits ${receivingUnit.name}`;
        ui.combatLog.appendChild(el);
      }
      // console.log(receivingUnit);
      return "Hit";
    }
  } else {
    attackAnimation(attackingUnit, "Miss", skill);
    showStats(state, ui, receivingUnit);

    const floatingValue = document.createElement("div");
    floatingValue.classList.add("floating-value");

    floatingValue.textContent = `Miss!`;
    floatingValue.style.setProperty("--float-color", "white");

    receivingUnit.node.appendChild(floatingValue);
    playAndRemove(floatingValue);

    // battle log

    if (state.useSkill) {
      const skillID = state.useSkill.dataset.id;

      const el = document.createElement("li");
      el.textContent = `${attackingUnit.name} misses ${skills[skillID].name} on ${receivingUnit.name}`;
      ui.combatLog.appendChild(el);
    } else {
      const el = document.createElement("li");
      el.textContent = `${attackingUnit.name} misses ${receivingUnit.name}`;
      ui.combatLog.appendChild(el);
    }
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
      tileAt(ui.boardEl, newRow, newCol).classList.add("attack-border");
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
      tileAt(ui.boardEl, newRow, newCol).classList.remove("attack-border");
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
