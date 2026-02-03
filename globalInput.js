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
import { activateActionbarInput } from "./actionbarInput.js";
export function activateGlobalInput(state, ui, gates) {
  // mouse click to run battle
  ui.container.addEventListener("click", (e) => {
    e.preventDefault();
    if (state.gameStart == false) {
      state.gameStart = true;
      ui.startCover.classList.add("hidden");
      runBattle(state, ui, gates);
    }
  });

  // handle the bgm
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

  // resets the game
  ui.resetGame.addEventListener("click", () => {
    // Refresh the browser
    window.location.reload();
  });
}

// this allows you to mouse click on the actionbar

// ui.actionBarEl.addEventListener("click", (e) => {
//   e.preventDefault();

//   const btn = e.target.closest(`button[data-action]`);
//   if (!btn) return false;
//   doAction(state, ui, btn.dataset.action);
// });
