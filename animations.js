// sprite/css animations

import { removePlayable } from "./turn.js";
import { gates } from "./script.js";
import { Phase } from "./state.js";
import { playSfx } from "./audio.js";
import { hurtGrunt } from "./audio.js";
import { swordHit } from "./audio.js";
import { deadGrunt } from "./audio.js";
import { critHit } from "./audio.js";
import { missHit } from "./audio.js";
import { attackHighlight } from "./combatInput.js";
// import { focusBoard } from "./uiControls.js";
import { items } from "./items.js";
import { skills } from "./skills.js";
import { highlightMove } from "./movement.js";
import { tileAt } from "./board.js";

export function playAnim(unit, className) {
  const el = unit.node;
  // console.log(className);
  if (el.dataset.dead === "1") return;

  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);

  el.addEventListener(
    "animationend",
    () => {
      if (
        unit.affiliation === 0 &&
        (className === "attack" || className === "fireball")
      ) {
        unit.node.classList.add("grayed");
      }
      el.classList.remove(className);
    },
    { once: true },
  );
}

export function attackAnimation(unit, type, skill = null) {
  // console.log(unit.node.classList);
  // console.log(skill);

  let skillName = skill ? skill.dataset.id : 0;

  if (skillName === "fireball") {
    playAnim(unit, "fireball");
  } else {
    playAnim(unit, "attack");
  }

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

  unit.node.classList.add("run");
}

export async function deadAnimation(unit) {
  unit.node.dataset.dead = "1";

  unit.node.classList.add("dead");
  playSfx(deadGrunt, 0.2, 200);
}

export function doAction(state, ui, action) {
  let active = null;
  let currentID = null;
  let description = null;
  switch (action) {
    case "attack":
      if (state.selectedUnit.hasAction === false) return;

      state.attackOn = true;

      state.isTargeting = true;
      // attack
      // attackHighlight(state, ui);

      attackHighlight(
        state,
        ui.boardEl,
        state.board.rows,
        state.board.cols,
        state.selectedUnit.row,
        state.selectedUnit.col,
        state.selectedUnit.range,
        state.attackTile,
      );

      // Centering attack hover on selected unit
      state.attackHover.row = state.selectedUnit.row;
      state.attackHover.col = state.selectedUnit.col;

      ui.boardEl.focus();
      const t = tileAt(
        ui.boardEl,
        state.selectedUnit.row,
        state.selectedUnit.col,
      );

      t.classList.remove("hover");

      // focusBoard(ui.boardEl);
      gates[Phase.PLAYER_ACTION].open("attack");

      break;
    case "move":
      if (state.selectedUnit.hasMove === false) return;
      highlightMove(
        state,
        ui.boardEl,
        state.board.rows,
        state.board.cols,
        state.selectedUnit.row,
        state.selectedUnit.col,
        state.selectedUnit.movement,
        state.highTile,
      );

      ui.boardEl.focus();
      gates[Phase.PLAYER_ACTION].open("move");
      // console.log("In Move");
      break;
    case "skill":
      if (state.selectedUnit.hasAction === false) return;

      state.attackHover.row = state.selectedUnit.row;
      state.attackHover.col = state.selectedUnit.col;
      // console.log("skill");
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
      // Glow
      ui.skillList.classList.add("glow");
      // console.log("Hit Skill");
      gates[Phase.PLAYER_ACTION].open("skill");

      break;
    case "item":
      if (state.selectedUnit.hasAction === false) return;

      // console.log("item running");
      if (state.selectedUnit.inventory.length === 0) break;

      const firstItem = ui.itemList.querySelector("button");
      firstItem?.focus();

      // item description
      active = document.activeElement;
      currentID = active.dataset.id;
      description = items[currentID].description;

      ui.description.textContent = `${description}`;
      ui.description.classList.remove("hidden");

      // Item images
      ui.itemImage.src = `${items[currentID].image}`;
      ui.itemImage.style.setProperty(`--top`, `${items[currentID].top}%`);
      ui.itemImage.style.setProperty(`--left`, `${items[currentID].left}%`);
      ui.itemImage.style.setProperty(`--height`, `${items[currentID].height}%`);

      ui.itemImage.classList.remove("hidden");
      ui.itemList.classList.add("glow");

      gates[Phase.PLAYER_ACTION].open("item");

      break;
    case "wait":
      // removePlayable(
      //   state.playerTurn,
      //   state.currentUnitsQueue,
      //   state.selectedUnit,
      // );

      state.selectedUnit.node.classList.add("grayed");

      // battle log
      const el = document.createElement("li");
      el.textContent = `${state.selectedUnit.name} is waiting`;
      ui.combatLog.appendChild(el);
      state.selectedUnit.playerWait();

      gates[Phase.PLAYER_ACTION].open("wait");

      break;
  }
}
