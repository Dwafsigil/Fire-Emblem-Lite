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

import { showUnitStats } from "./unitStatsUI.js";

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
        state.selectedUnit.strengthValue.classList.add("hidden");

        state.playerSelected = false;
        state.selectedUnit = null;

        playSfx(btnClick, 0.5, 0);
        removeHighlight(ui.boardEl, state.highTile);
        clearHighTile(state.highTile);
        return;
      }
      // cancel in targeting
      if (state.phase === Phase.PLAYER_ACTION) {
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

    // 2. spaceBar selecting and deselecting player
    if (state.phase === Phase.PLAYER_SELECT && e.key === "z") {
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

          state.selectedUnit.strengthValue.classList.remove("hidden");

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
      removeHover(state, ui);
      moveHover(state, ui, ...moves[e.key]);

      // terrain code
      let terrain = "grass";

      for (const type in state.obstacleTypes) {
        if (
          state.obstacleTypes[type].some(
            ([r, c]) => r === state.hover.row && c === state.hover.col,
          )
        ) {
          terrain = type;
          break;
        }
      }

      switch (terrain) {
        case "rock":
          ui.terrainStat.textContent = "Hill";
          break;
        case "forest":
          ui.terrainStat.textContent = "Forest";
          break;
        case "castle":
          ui.terrainStat.textContent = "Castle";
          break;
        case "grass":
          ui.terrainStat.textContent = "Grass";
          break;
      }
      console.log(terrain);

      // TURN INTO A FUNCTION LATER UPDATES UNIT STATS
      if (
        isOccupied(state.units, state.hover.row, state.hover.col) ||
        state.playerSelected
      ) {
        const hoveredUnit =
          unitAt(state.units, state.hover.row, state.hover.col) ||
          state.selectedUnit;

        ui.unitName.textContent = `${hoveredUnit.name}`;
        ui.unitHealthStat.textContent = `HP: ${hoveredUnit.health}`;
        ui.unitAttackStat.textContent = `ATK: ${hoveredUnit.strength}`;
        ui.unitDefenseStat.textContent = `DEF: ${hoveredUnit.defense}`;
        ui.unitMovementStat.textContent = `MOV: ${hoveredUnit.movement}`;

        ui.statList.classList.remove("hidden");
        console.log(hoveredUnit.name);
      } else {
        ui.statList.classList.add("hidden");
      }

      if (state.playerSelected) {
        console.log("Moving Player");
        movePlayer(state, ui, ...moves[e.key]);
      }
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
      console.log("inside attacking");
      attack(state);
      state.attackOn = false;
      if (state.receivingUnit.checkDead()) {
        removeDead(state, ui);
      }
      if (!state.receivingUnit.checkDead()) {
        hurtAnimation(state.receivingUnit);
      }

      removeAttackHighlight(state, ui);
      removeConfirmHiglight(state, ui);

      state.receivingUnit = null;
      state.unitHighlighted = false;
      state.isTargeting = false;
      playSfx(btnClick, 0.5, 0);

      gates[Phase.PLAYER_ACTION].open();
      return;
    }
  });
}
