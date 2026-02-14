// sprite/css animations

import { updatePlayable } from "./turn.js";
import { gates } from "./script.js";
import { Phase } from "./state.js";
import { playSfx } from "./audio.js";
import { hurtGrunt } from "./audio.js";
import { swordHit } from "./audio.js";
import { deadGrunt } from "./audio.js";
import { critHit } from "./audio.js";
import { missHit } from "./audio.js";
import { attackHighlight } from "./combatInput.js";
import { focusBoard } from "./uiControls.js";
import { items } from "./items.js";
import { skills } from "./skills.js";

export function playAnim(unit, className, delay) {
  unit.node.classList.remove(className);
  unit.node.style.setProperty(
    "--sprite-url",
    `url("assets/${unit.unitType}/${className}.png")`,
  );
  unit.node.classList.add(className);
  setTimeout(() => {
    unit.node.classList.remove(className);
    unit.node.style.setProperty(
      "--sprite-url",
      `url("assets/${unit.unitType}/Idle.png")`,
    );
  }, delay);
}

export function attackAnimation(unit, type) {
  playAnim(unit, "attack3", 600);

  if (type === "Hit") playSfx(swordHit, 0.5, 0);
  if (type === "Crit") playSfx(critHit, 0.5, 0);
  if (type === "Miss") playSfx(missHit, 0.9, 0);
}

export function hurtAnimation(unit) {
  playAnim(unit, "hurt", 500);
  playSfx(hurtGrunt, 0.3, 200);
}

export function runAnimation(unit) {
  unit.node.classList.remove("run");
  unit.node.style.setProperty(
    "--sprite-url",
    `url("assets/${unit.unitType}/Run.png")`,
  );
  unit.node.classList.add("run");
  // playSfx(deadGrunt, 0.2, 200);
}

export async function deadAnimation(unit) {
  unit.node.classList.remove("dead");
  // console.log("Running dead animation");
  unit.node.style.setProperty(
    "--sprite-url",
    `url("assets/${unit.unitType}/dead.png")`,
  );
  unit.node.classList.add("dead");
  playSfx(deadGrunt, 0.2, 200);
  // removeDead();
}

export function doAction(state, ui, action) {
  let active = null;
  let currentID = null;
  let description = null;
  switch (action) {
    case "attack":
      if (ui.actionButtons.attack.getAttribute("button-disabled") === "true")
        return;
      state.attackOn = true;

      state.isTargeting = true;
      attackHighlight(state, ui);
      focusBoard(ui.boardEl);
      gates[Phase.PLAYER_ACTION].open("attack");

      break;
    case "skill":
      console.log("skill");
      const noUseLeft = state.selectedUnit.skills.every((skill) => {
        return skill.uses == 0;
      });

      if (noUseLeft) break;
      const firstSkill = ui.skillList.querySelector("button");
      firstSkill?.focus();

      // skill description
      active = document.activeElement;
      currentID = active.dataset.id;
      description = skills[currentID].description;

      ui.description.textContent = `${description}`;
      ui.description.classList.remove("hidden");

      gates[Phase.PLAYER_ACTION].open("skill");

      break;
    case "item":
      console.log("item");
      if (state.selectedUnit.inventory.length === 0) break;

      const firstItem = ui.itemList.querySelector("button");
      firstItem?.focus();

      // item description
      active = document.activeElement;
      currentID = active.dataset.id;
      description = items[currentID].description;

      ui.description.textContent = `${description}`;
      ui.description.classList.remove("hidden");
      gates[Phase.PLAYER_ACTION].open("item");

      break;
    case "wait":
      updatePlayable(
        state.playerTurn,
        state.currentUnitsQueue,
        state.selectedUnit,
      );

      // battle log
      const el = document.createElement("li");
      el.textContent = `${state.selectedUnit.name} is waiting`;
      ui.combatLog.appendChild(el);
      state.selectedUnit.playerWait();

      gates[Phase.PLAYER_ACTION].open("wait");

      break;
  }
}
