import { nextIndex, setActive } from "./uiControls.js";
import { doAction } from "./animations.js";
import { playSfx, btnClick } from "./audio.js";

export function activateActionbarInput(state, ui) {
  ui.actionBarEl.addEventListener("keydown", (e) => {
    const handleKeys = new Set(["ArrowLeft", "ArrowRight", "z"]);

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

    // confirm button choice
    if (e.code == "KeyZ") {
      const btn = e.target.closest(`button[data-action]`);
      doAction(state, ui, btn.dataset.action);
      playSfx(btnClick, 0.5, 0);
    }
  });
}
