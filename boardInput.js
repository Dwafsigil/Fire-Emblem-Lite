import { Phase } from "./state.js";
import { updatePlayable, checkPlayable, isBattleOver } from "./turn.js";
import { isOccupied, enemyAt, unitAt } from "./unitQueries.js";
import { openActionBar } from "./uiControls.js";
import { removeHover, moveHover } from "./hoverView.js";
import {
  removeAttackHighlight,
  removeConfirmHiglight,
  attack,
  attackedUnit,
  confirmHighlight,
} from "./combatInput.js";
import { hurtAnimation } from "./animations.js";
import { placePlayer, removeDead } from "./unitsView.js";
import { playSfx, btnClick } from "./audio.js";
import {
  highlightMove,
  removeHighlight,
  clearHighTile,
  updateObstacle,
  movePlayer,
} from "./movement.js";

import { showStats } from "./unitStatsUI.js";
import { showTerrainInfo } from "./terrainInfo.js";

import { showUnitInfo } from "./unitStatsUI.js";

export function activateBoardInput(state, ui, gates) {
  ui.boardEl.addEventListener("keydown", (e) => {
    const moves = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowRight: [0, 1],
      ArrowLeft: [0, -1],
    };

    const handleKeys = new Set([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "z",
      "x",
      " ",
    ]);

    if (handleKeys.has(e.key)) e.preventDefault();

    // 1. x go back
    if (e.key == "x") {
      // cancel when player selected
      if (state.playerSelected && state.phase === Phase.PLAYER_SELECT) {
        placePlayer(state, ui, state.startRow, state.startCol);
        state.currentUnitsQueue.push(state.selectedUnit);
        // state.selectedUnit.strengthValue.classList.add("hidden");

        state.playerSelected = false;
        state.selectedUnit = null;

        playSfx(btnClick, 0.5, 0);
        removeHighlight(ui.boardEl, state.highTile);
        clearHighTile(state.highTile);
        return;
      }
      // cancel in targeting
      if (state.phase === Phase.PLAYER_ATTACK) {
        removeAttackHighlight(state, ui);
        removeConfirmHiglight(state, ui);
        openActionBar(ui.actionBarEl);

        state.attackOn = false;
        state.isTargeting = false;
        state.unitHighlighted = false;
        state.receivingUnit = null;

        playSfx(btnClick, 0.5, 0);
        return;
      }

      return;
    }

    // 2. z selecting and deselecting player
    if (state.phase === Phase.PLAYER_SELECT && e.code === "KeyZ") {
      console.log("Z");
      if (
        isOccupied(state.units, state.hover.row, state.hover.col) &&
        !state.playerSelected
      ) {
        state.selectedUnit = unitAt(
          state.units,
          state.hover.row,
          state.hover.col,
        );

        if (checkPlayable(state.currentUnitsQueue, state.selectedUnit)) {
          state.startRow = state.hover.row;
          state.startCol = state.hover.col;

          state.playerSelected = true;

          updateObstacle(state);

          updatePlayable(
            state.playerTurn,
            state.currentUnitsQueue,
            state.selectedUnit,
          );

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

          playSfx(btnClick, 0.5, 0);

          // state.selectedUnit.strengthValue.classList.remove("hidden");

          // console.log(state.selectedUnit.hitRate);

          return;
        }
        return;
      }

      if (state.playerSelected) {
        const hoveringOtherUnit = state.units.some(
          (u) =>
            u.row == state.hover.row &&
            u.col == state.hover.col &&
            u !== state.selectedUnit,
        );

        if (hoveringOtherUnit) return;

        removeHighlight(ui.boardEl, state.highTile);
        clearHighTile(state.highTile);

        state.playerSelected = false;

        updateObstacle(state);
        updatePlayable(
          state.playerTurn,
          state.currentUnitsQueue,
          state.selectedUnit,
        );

        playSfx(btnClick, 0.5, 0);
        openActionBar(ui.actionBarEl);

        gates[Phase.PLAYER_SELECT].open(state.selectedUnit);

        return;
      }
      return;
    }

    // 3. Arrow Keys move and hover in 4 directions

    if (moves[e.key] && !state.attackOn) {
      // console.log(state.phase);
      if (state.playerSelected) {
        const floating =
          state.selectedUnit.node.querySelector(".floating-value");
        if (floating) {
          floating.remove();
        }
      }

      removeHover(state, ui);
      moveHover(state, ui, ...moves[e.key]);

      if (!state.playerSelected) {
        ui.itemList.replaceChildren();
        ui.skillList.replaceChildren();
      }

      if (state.playerSelected) {
        // console.log("Moving Player");
        movePlayer(state, ui, ...moves[e.key]);
      }
      showTerrainInfo(state, ui);
      showUnitInfo(state, ui);
      return;
    }

    // 4. move attack hover onto enemy
    if (state.isTargeting) {
      removeConfirmHiglight(state, ui);
      switch (e.key) {
        case "ArrowUp":
          if (
            enemyAt(
              state.playerTurn,
              state.units,
              state.selectedUnit.row - 1,
              state.selectedUnit.col,
            )
          )
            confirmHighlight(
              ui,
              state.selectedUnit.row - 1,
              state.selectedUnit.col,
            );
          attackedUnit(
            state,
            state.selectedUnit.row - 1,
            state.selectedUnit.col,
          );
          break;
        case "ArrowDown":
          if (
            enemyAt(
              state.playerTurn,
              state.units,
              state.selectedUnit.row + 1,
              state.selectedUnit.col,
            )
          )
            confirmHighlight(
              ui,
              state.selectedUnit.row + 1,
              state.selectedUnit.col,
            );
          attackedUnit(
            state,
            state.selectedUnit.row + 1,
            state.selectedUnit.col,
          );
          break;
        case "ArrowRight":
          if (
            enemyAt(
              state.playerTurn,
              state.units,
              state.selectedUnit.row,
              state.selectedUnit.col + 1,
            )
          )
            confirmHighlight(
              ui,
              state.selectedUnit.row,
              state.selectedUnit.col + 1,
            );
          attackedUnit(
            state,
            state.selectedUnit.row,
            state.selectedUnit.col + 1,
          );
          break;
        case "ArrowLeft":
          if (
            enemyAt(
              state.playerTurn,
              state.units,
              state.selectedUnit.row,
              state.selectedUnit.col - 1,
            )
          )
            confirmHighlight(
              ui,
              state.selectedUnit.row,
              state.selectedUnit.col - 1,
            );
          attackedUnit(
            state,
            state.selectedUnit.row,
            state.selectedUnit.col - 1,
          );
          break;
      }

      state.unitHighlighted = true;
    }

    // 5. z confirm attack

    if (
      state.unitHighlighted == true &&
      state.receivingUnit !== null &&
      state.isTargeting == true &&
      e.key == "z"
    ) {
      // console.log("inside attacking");

      const type = attack(
        state.selectedUnit,
        state.receivingUnit,
        state.useSkill,
        state,
        ui,
      );

      if (state.useSkill) {
        const removeSkillUse = state.useSkill.dataset.id;

        console.log(removeSkillUse);
        console.log(state.selectedUnit.skills);
        const skill = state.selectedUnit.skills.find((skill) => {
          return skill.id === removeSkillUse;
        });

        skill.uses--;

        if (skill.uses == 0) {
          const index = state.selectedUnit.skills.findIndex(
            (skill) => skill.id === removeSkillUse,
          );

          // state.selectedUnit.skills.splice(index, 1);
        }
        ui.skillList.replaceChildren();
        ui.itemList.replaceChildren();

        showUnitInfo(state, ui);
      }

      // console.log(type);
      state.attackOn = false;
      if (state.receivingUnit.checkDead()) {
        removeDead(state, ui, state.receivingUnit);
      }
      if (
        (!state.receivingUnit.checkDead() && type === "Hit") ||
        type === "Crit"
      ) {
        hurtAnimation(state.receivingUnit);
      }

      removeAttackHighlight(state, ui);
      removeConfirmHiglight(state, ui);

      state.receivingUnit = null;
      state.unitHighlighted = false;
      state.isTargeting = false;
      playSfx(btnClick, 0.5, 0);

      state.useSkill = null;
      // attack marker
      if (state.phase === Phase.PLAYER_SKILL) gates[Phase.PLAYER_SKILL].open();
      if (state.phase === Phase.PLAYER_ATTACK) {
        gates[Phase.PLAYER_ATTACK].open();
      }

      return;
    }
  });
}
