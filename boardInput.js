import { Phase } from "./state.js";
import { updatePlayable, checkPlayable, isBattleOver } from "./turn.js";
import { isOccupied, enemyAt, unitAt } from "./unitQueries.js";
// import { openActionBar } from "./uiControls.js";
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
import { skills } from "./skills.js";
import { showStats } from "./unitStatsUI.js";
import { showTerrainInfo } from "./terrainInfo.js";
import { tileAt } from "./board.js";
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
      // console.log("detecting x");
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
        tileAt(
          ui.boardEl,
          state.attackHover.row,
          state.attackHover.col,
        ).classList.remove("attack-confirm");
        state.attackTile.forEach((u) => {
          tileAt(ui.boardEl, u[0], u[1]).classList.remove("attack-border");
        });
        // openActionBar(ui.actionBarEl);

        const firstButton = ui.actionBarEl.querySelector("button");
        firstButton?.focus();

        state.attackOn = false;
        state.isTargeting = false;
        state.unitHighlighted = false;
        state.receivingUnit = null;

        playSfx(btnClick, 0.5, 0);
        gates[Phase.PLAYER_ATTACK].cancel();
        return;
      }

      // cancel skill targeting
      if (state.phase === Phase.PLAYER_SKILL && state.attackOn) {
        let active = null;
        let currentID = null;
        let description = null;
        removeAttackHighlight(state, ui);
        removeConfirmHiglight(state, ui);
        tileAt(
          ui.boardEl,
          state.attackHover.row,
          state.attackHover.col,
        ).classList.remove("attack-confirm");
        state.attackTile.forEach((u) => {
          tileAt(ui.boardEl, u[0], u[1]).classList.remove("attack-border");
        });

        state.attackOn = false;
        state.isTargeting = false;
        state.unitHighlighted = false;
        state.receivingUnit = null;

        const firstSkill = ui.skillList.querySelector("button");
        firstSkill?.focus();

        // skill description
        active = document.activeElement;
        currentID = active.dataset.id;
        description = skills[currentID].description;

        ui.description.textContent = `${description}`;
        ui.description.classList.remove("hidden");

        return;
      }

      return;
    }

    // 2. z selecting and deselecting player
    if (state.phase === Phase.PLAYER_SELECT && e.code === "KeyZ") {
      // console.log("Z");
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

        // Testing
        playSfx(btnClick, 0.5, 0);

        // actionbar stuff
        ui.actionBarEl.classList.remove("hidden");

        const firstButton = ui.actionBarEl.querySelector("button");
        firstButton?.focus();

        // openActionBar(ui.actionBarEl);

        gates[Phase.PLAYER_SELECT].open(state.selectedUnit);

        return;
      }
      return;
    }

    // 3. Arrow Keys move and hover in 4 directions

    if (
      moves[e.key] &&
      !state.attackOn &&
      state.phase === Phase.PLAYER_SELECT
    ) {
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

    // 4. move attack hover onto enemy.
    if (state.isTargeting) {
      removeConfirmHiglight(state, ui);
      // console.log("Detecting arrow keys");
      // console.log(state.attackTile);

      switch (e.key) {
        case "ArrowUp":
          if (
            state.attackTile.some(
              (u) =>
                u[0] === state.attackHover.row - 1 &&
                u[1] === state.attackHover.col,
            )
          ) {
            tileAt(
              ui.boardEl,
              state.attackHover.row,
              state.attackHover.col,
            ).classList.remove("attack-confirm");
            state.attackHover.row = state.attackHover.row - 1;
            // console.log("Worked");

            confirmHighlight(ui, state.attackHover.row, state.attackHover.col);
          }
          // if (
          //   enemyAt(
          //     state.playerTurn,
          //     state.units,
          //     state.selectedUnit.row - 1,
          //     state.selectedUnit.col,
          //   )
          // )
          //   confirmHighlight(
          //     ui,
          //     state.selectedUnit.row - 1,
          //     state.selectedUnit.col,
          //   );
          // attackedUnit(
          //   state,
          //   state.selectedUnit.row - 1,
          //   state.selectedUnit.col,
          // );
          break;
        case "ArrowDown":
          if (
            state.attackTile.some(
              (u) =>
                u[0] === state.attackHover.row + 1 &&
                u[1] === state.attackHover.col,
            )
          ) {
            tileAt(
              ui.boardEl,
              state.attackHover.row,
              state.attackHover.col,
            ).classList.remove("attack-confirm");
            state.attackHover.row = state.attackHover.row + 1;

            confirmHighlight(ui, state.attackHover.row, state.attackHover.col);
          }
          // if (
          //   enemyAt(
          //     state.playerTurn,
          //     state.units,
          //     state.selectedUnit.row + 1,
          //     state.selectedUnit.col,
          //   )
          // )
          //   confirmHighlight(
          //     ui,
          //     state.selectedUnit.row + 1,
          //     state.selectedUnit.col,
          //   );
          // attackedUnit(
          //   state,
          //   state.selectedUnit.row + 1,
          //   state.selectedUnit.col,
          // );
          break;
        case "ArrowRight":
          if (
            state.attackTile.some(
              (u) =>
                u[0] === state.attackHover.row &&
                u[1] === state.attackHover.col + 1,
            )
          ) {
            tileAt(
              ui.boardEl,
              state.attackHover.row,
              state.attackHover.col,
            ).classList.remove("attack-confirm");

            state.attackHover.col = state.attackHover.col + 1;

            confirmHighlight(ui, state.attackHover.row, state.attackHover.col);
          }
          // if (
          //   enemyAt(
          //     state.playerTurn,
          //     state.units,
          //     state.selectedUnit.row,
          //     state.selectedUnit.col + 1,
          //   )
          // )
          //   confirmHighlight(
          //     ui,
          //     state.selectedUnit.row,
          //     state.selectedUnit.col + 1,
          //   );
          // attackedUnit(
          //   state,
          //   state.selectedUnit.row,
          //   state.selectedUnit.col + 1,
          // );
          break;
        case "ArrowLeft":
          if (
            state.attackTile.some(
              (u) =>
                u[0] === state.attackHover.row &&
                u[1] === state.attackHover.col - 1,
            )
          ) {
            tileAt(
              ui.boardEl,
              state.attackHover.row,
              state.attackHover.col,
            ).classList.remove("attack-confirm");
            state.attackHover.col = state.attackHover.col - 1;

            confirmHighlight(ui, state.attackHover.row, state.attackHover.col);
          }
          // if (
          //   enemyAt(
          //     state.playerTurn,
          //     state.units,
          //     state.selectedUnit.row,
          //     state.selectedUnit.col - 1,
          //   )
          // )
          //   confirmHighlight(
          //     ui,
          //     state.selectedUnit.row,
          //     state.selectedUnit.col - 1,
          //   );
          // attackedUnit(
          //   state,
          //   state.selectedUnit.row,
          //   state.selectedUnit.col - 1,
          // );
          break;
      }

      state.unitHighlighted = true;
    }

    // 5. z confirm attack

    if (
      // state.unitHighlighted == true &&
      // state.receivingUnit !== null &&
      state.isTargeting == true &&
      e.key == "z" &&
      attackedUnit(state, state.attackHover.row, state.attackHover.col)
    ) {
      // console.log("inside attacking");

      console.log(
        tileAt(ui.boardEl, state.attackHover.row, state.attackHover.col),
      );

      // console.log(state.useSkill);
      // console.log("hit z attack/skill");

      // attackedUnit(state, state.attackHover.row, state.attackHover.col);
      const type = attack(
        state.selectedUnit,
        state.receivingUnit,
        state.useSkill,
        state,
        ui,
      );

      // Removing a use

      if (state.useSkill) {
        const removeSkillUse = state.useSkill.dataset.id;

        // console.log(removeSkillUse);
        // console.log(state.selectedUnit.skills);
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

    // if game is over
    // if (state.phase === Phase.GAME_OVER && e.key === "z") {
    //   console.log("Game Restarted");
    // }
  });
}
