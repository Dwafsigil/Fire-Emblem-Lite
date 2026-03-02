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

  document.addEventListener("keydown", (e) => {
    // console.log("toggle");

    if (e.key == "b") {
      bgmMuted = !bgmMuted;
      if (bgmMuted == true) {
        bgm.pause();
      } else {
        bgm.play();
      }
    }
  });

  document.addEventListener("mousedown", (e) => {
    if (state.phase === Phase.MENU) return;
    e.preventDefault();
  });
}
