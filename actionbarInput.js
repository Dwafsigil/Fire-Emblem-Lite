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
import { activateBoardInput } from "./boardInput.js";

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

export function activateActionbarInput(state, ui, gates) {
  ui.actionBarEl.addEventListener("keydown", (e) => {
    const handleKeys = new Set(["ArrowLeft", "ArrowRight", "z", "x", " "]);

    if (handleKeys.has(e.key)) e.preventDefault();

    // Move action bar to the left
    if (e.key == "ArrowLeft") {
      state.i = nextIndex(state.i, -1);
      setActive(state.i);
      playSfx(btnClick, 0.5, 0);
    }

    // Move action bar to the right
    if (e.key == "ArrowRight") {
      state.i = nextIndex(state.i, 1);
      setActive(state.i);
      playSfx(btnClick, 0.5, 0);
    }

    // confirm button
    if (e.key == "z") {
      const btn = e.target.closest(`button[data-action]`);
      doAction(state, ui, btn.dataset.action);
      playSfx(btnClick, 0.5, 0);
    }
  });
}
