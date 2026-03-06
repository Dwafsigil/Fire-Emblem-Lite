import { runGame } from "./runGame.js";
import { bgm } from "./audio.js";
import { Phase } from "./state.js";
import { btnClick, playSfx } from "./audio.js";
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
      switch (btn.dataset.action) {
        case "start": {
          playSfx(btnClick, 0.5, 0);

          ui.startCover.classList.add("hidden");
          gates[Phase.MENU].open();
          break;
        }
        case "controls": {
          playSfx(btnClick, 0.5, 0);

          state.currentMenu = "controls";
          renderMenu(state, ui);
          break;
        }
        case "credits": {
          playSfx(btnClick, 0.5, 0);

          state.currentMenu = "credits";
          renderMenu(state, ui);
          break;
        }
        case "back": {
          playSfx(btnClick, 0.5, 0);

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

  let bgmMuted = false;
  document.addEventListener("keydown", (e) => {
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
