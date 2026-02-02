// main file

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

export const state = createInitialState();
export const ui = createUI();
initUIControls(ui);
export let consoleContent;

export const gates = {
  [Phase.PLAYER_SELECT]: createGate(),
  [Phase.PLAYER_ACTION]: createGate(),
  [Phase.ENEMY_TURN]: createGate(),
};

// To move Hover and Player with Arrow Keys ✅
ui.boardEl.addEventListener("keydown", (e) => {
  const moves = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowRight: [0, 1],
    ArrowLeft: [0, -1],
  };

  if (state.attackOn == true) return;

  if (moves[e.key]) {
    e.preventDefault();
    removeHover(state, ui);
    moveHover(state, ui, ...moves[e.key]);

    if (state.playerSelected) {
      console.log("Moving Player");
      movePlayer(state, ui, ...moves[e.key]);
    }
  }
});

// CHANGE THIS UP
// Select and Deslect Player with Space
// might be good check ✅
ui.boardEl.addEventListener("keydown", (e) => {
  e.preventDefault();

  // if it's the player phase
  if (state.phase !== Phase.PLAYER_SELECT) return;

  // if selecting a player
  if (
    e.key == "z" &&
    isOccupied(state.units, state.hover.row, state.hover.col) &&
    !state.playerSelected
  ) {
    state.selectedUnit = unitAt(state.units, state.hover.row, state.hover.col);
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
  }
});

// move action bar to right
ui.actionBarEl.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "ArrowRight") {
    state.i = nextIndex(state.i, 1);
    setActive(state.i);
    playSfx(btnClick, 0.5, 0);
  }
});

// move action bar to left

ui.actionBarEl.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "ArrowLeft") {
    state.i = nextIndex(state.i, -1);
    setActive(state.i);
    playSfx(btnClick, 0.5, 0);
  }
});

// confirm action bar button
ui.actionBarEl.addEventListener("keydown", (e) => {
  e.preventDefault();

  if (e.key == "z") {
    const btn = e.target.closest(`button[data-action]`);
    doAction(state, ui, btn.dataset.action);
    playSfx(btnClick, 0.5, 0);
  }
});

ui.actionBarEl.addEventListener("click", (e) => {
  e.preventDefault();

  const btn = e.target.closest(`button[data-action]`);
  if (!btn) return false;
  doAction(state, ui, btn.dataset.action);
});

ui.boardEl.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (!state.isTargeting) return false;
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
      attackedUnit(state, state.selectedUnit.row - 1, state.selectedUnit.col);
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
      attackedUnit(state, state.selectedUnit.row + 1, state.selectedUnit.col);
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
      attackedUnit(state, state.selectedUnit.row, state.selectedUnit.col + 1);
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
      attackedUnit(state, state.selectedUnit.row, state.selectedUnit.col - 1);
      break;
  }

  state.unitHighlighted = true;
});

// To attack
ui.boardEl.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (state.unitHighlighted == false) return false;
  if (state.receivingUnit == null) return false;
  if (state.isTargeting == false) return false;
  if (e.key == "z") {
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
  }
});

// When selected a unit
ui.boardEl.addEventListener("keydown", (e) => {
  if (e.key == "x") {
    if (state.playerSelected && state.phase == "player_select") {
      placePlayer(state, ui, state.startRow, state.startCol);
      state.currentUnitsQueue.push(state.selectedUnit);
      state.selectedUnit.strengthValue.classList.add("hidden");

      state.playerSelected = false;
      state.selectedUnit = null;
      playSfx(btnClick, 0.5, 0);

      removeHighlight(ui.boardEl, state.highTile);
    }
    if (state.phase == "player_action") {
      removeAttackHighlight(state, ui);
      removeConfirmHiglight(state, ui);
      openActionBar(ui.actionBarEl);
      state.attackOn = false;
      state.isTargeting = false;
      playSfx(btnClick, 0.5, 0);
    }
  }
});

ui.container.addEventListener("click", (e) => {
  e.preventDefault();
  if (state.gameStart == false) {
    state.gameStart = true;
    ui.startCover.classList.add("hidden");
    runBattle(state, ui, gates);
  }
});

let bgmMuted = false;
// toggleBGM.addEventListener("click", () => {
//   // console.log("toggle");
//   bgmMuted = !bgmMuted;
//   if (bgmMuted == true) {
//     bgm.pause();
//   } else {
//     bgm.play();
//   }
// });
ui.boardEl.addEventListener("keydown", (e) => {
  // console.log("toggle");

  if (e.key == "l") {
    bgmMuted = !bgmMuted;
    if (bgmMuted == true) {
      bgm.pause();
    } else {
      bgm.play();
    }
  }
});

ui.resetGame.addEventListener("click", () => {
  // Refresh the browser
  window.location.reload();
});
