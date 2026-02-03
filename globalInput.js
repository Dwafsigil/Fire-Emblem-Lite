import { runBattle } from "./turn.js";
import { bgm } from "./audio.js";

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

  // click to toggle bgm
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

  // l to toggle button
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
