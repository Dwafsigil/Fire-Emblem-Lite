import { createInitialState, Phase } from "./state.js";
import { createBoard, tileAt, inBounds } from "./board.js";
import { createGate, CANCEL } from "./gates.js";
import { createUI } from "./ui.js";
import {
  runBattle,
  initPlayerTurn,
  hasPlayableUnits,
  updatePlayable,
  isBattleOver,
  showPhase,
} from "./turn.js";
import { isOccupied } from "./unitQueries.js";
import { unitAt } from "./unitQueries.js";
import { checkPlayable } from "./turn.js";
import { openActionBar } from "./uiControls.js";
import { removeHover, moveHover } from "./hoverView.js";
import { movePlayer } from "./movement.js";
import { nextIndex } from "./uiControls.js";
import { setActive } from "./uiControls.js";
import { doAction } from "./animations.js";
import { removeAttackHighlight } from "./combatInput.js";
import { removeConfirmHiglight } from "./combatInput.js";
import { enemyAt } from "./unitQueries.js";
import { attackedUnit } from "./combatInput.js";
import { attack } from "./combatInput.js";
import { confirmHighlight } from "./combatInput.js";
import { hurtAnimation } from "./animations.js";
import { removeDead } from "./unitsView.js";
import { placePlayer } from "./unitsView.js";
import { gates } from "./script.js";
import {
  bgm,
  startMusic,
  playSfx,
  btnClick,
  hoverSound,
  swordHit,
  hurtGrunt,
  deadGrunt,
} from "./audio.js";
import {
  highlightMove,
  removeHighlight,
  clearHighTile,
  highlightBounds,
  updateObstacle,
  ifObstacle,
} from "./movement.js";
import { initUIControls } from "./uiControls.js";

export function activateBoardInput(state, ui, gates) {
  ui.boardEl.addEventListener("keydown", (e) => {
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
      if (state.playerSelected && state.phase === Phase.PLAYER_SELECT) {
        placePlayer(state, ui, state.startRow, state.startCol);
        state.currentUnitsQueue.push(state.selectedUnit);
        state.selectedUnit.strengthValue.classList.add("hidden");

        state.playerSelected = false;
        state.selectedUnit = null;
        playSfx(btnClick, 0.5, 0);

        removeHighlight(ui.boardEl, state.highTile);
      }
      if (state.phase === Phase.PLAYER_ACTION) {
        removeAttackHighlight(state, ui);
        removeConfirmHiglight(state, ui);
        openActionBar(ui.actionBarEl);
        state.attackOn = false;
        state.isTargeting = false;
        playSfx(btnClick, 0.5, 0);
      }

      return;
    }

    // 2. z selecting and deselecting player
    if (
      state.phase === Phase.PLAYER_SELECT &&
      e.key == "z" &&
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
        console.log("Selected Unit", state.selectedUnit);
        state.selectedUnit.strengthValue.classList.remove("hidden");

        return;
      }
    }
    if (e.key == "z" && state.playerSelected == true) {
      if (
        state.units.some(
          (u) =>
            u.row == state.hover.row &&
            u.col == state.hover.col &&
            u !== state.selectedUnit,
        )
      )
        return;

      console.log("Inside deselect");

      removeHighlight(ui.boardEl, state.highTile);
      clearHighTile(state.highTile);
      // state.selectedUnit = null;
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
      // playSfx(btnClick, 0.5, 0);

      return;
    }

    // 3. Arrow Keys move and hover in 4 directions
    const moves = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowRight: [0, 1],
      ArrowLeft: [0, -1],
    };

    // if (state.attackOn == true) return;

    if (moves[e.key] && state.attackOn !== true) {
      e.preventDefault();
      removeHover(state, ui);
      moveHover(state, ui, ...moves[e.key]);

      if (state.playerSelected) {
        console.log("Moving Player");
        movePlayer(state, ui, ...moves[e.key]);
      }
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
