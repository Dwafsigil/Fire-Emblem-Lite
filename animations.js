// sprite/css animations

import { updatePlayable } from "./turn.js";
import { gates } from "./script.js";
import { Phase } from "./state.js";
import { playSfx } from "./audio.js";
import { hurtGrunt } from "./audio.js";
import { swordHit } from "./audio.js";
import { deadGrunt } from "./audio.js";
import { attackHighlight } from "./combatInput.js";
import { focusBoard } from "./uiControls.js";

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

export function attackAnimation(unit) {
  playAnim(unit, "attack3", 600);
  playSfx(swordHit, 0.5, 0);
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
  unit.node.style.setProperty(
    "--sprite-url",
    `url("assets/${unit.unitType}/dead.png")`,
  );
  unit.node.classList.add("dead");
  playSfx(deadGrunt, 0.2, 200);
  // removeDead();
}

export function doAction(state, ui, action) {
  switch (action) {
    case "attack":
      if (ui.actionButtons.attack.getAttribute("button-disabled") === "true")
        return;
      state.attackOn = true;

      state.isTargeting = true;
      attackHighlight(state, ui);
      focusBoard(ui.boardEl);
      break;
    case "ability":
      break;
    case "item":
      console.log("item");
      const firstItem = ui.itemList.querySelector("button");
      firstItem?.focus();

      break;
    case "wait":
      updatePlayable(
        state.playerTurn,
        state.currentUnitsQueue,
        state.selectedUnit,
      );
      state.selectedUnit.playerWait();

      gates[Phase.PLAYER_ACTION].open("wait");

      break;
  }
}
