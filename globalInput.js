import { runGame } from "./runGame.js";
import { bgm } from "./audio.js";
import { Phase } from "./state.js";
import { renderMenu } from "./menu.js";

export function activateGlobalInput(state, ui, gates) {
  // mouse click to run battle
  // ui.container.addEventListener("click", (e) => {
  //   e.preventDefault();
  //   if (state.gameStart == false) {
  //     state.gameStart = true;
  //     ui.startCover.classList.add("hidden");
  //     runGame(state, ui, gates);
  //   }
  // });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");

    if (!btn) return;

    if (state.phase === Phase.MENU) {
      // console.log(btn.dataset.action);
      switch (btn.dataset.action) {
        case "start": {
          // console.log("start");
          ui.startCover.classList.add("hidden");
          gates[Phase.MENU].open();
          break;
        }
        case "controls": {
          // console.log("controls");
          state.currentMenu = "controls";
          renderMenu(state, ui);
          break;
        }
        case "credits": {
          // console.log("credits");
          state.currentMenu = "credits";
          renderMenu(state, ui);
          break;
        }
        case "back": {
          // console.log("back");
          state.currentMenu = "main";
          renderMenu(state, ui);
          break;
        }
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyR") {
      window.location.reload();
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

  //   // l to toggle button
  //   ui.boardEl.addEventListener("keydown", (e) => {
  //     // console.log("toggle");

  //     if (e.key == "l") {
  //       bgmMuted = !bgmMuted;
  //       if (bgmMuted == true) {
  //         bgm.pause();
  //       } else {
  //         bgm.play();
  //       }
  //     }
  //   });

  //   // resets the game
  //   ui.resetGame.addEventListener("click", () => {
  //     // Refresh the browser
  //     window.location.reload();
  //   });
  // }

  // this allows you to mouse click on the actionbar

  // ui.actionBarEl.addEventListener("click", (e) => {
  //   e.preventDefault();

  //   const btn = e.target.closest(`button[data-action]`);
  //   if (!btn) return false;
  //   doAction(state, ui, btn.dataset.action);
  // });
}
