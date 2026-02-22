// import { nextIndex, setActive } from "./uiControls.js";
import { doAction } from "./animations.js";
import { playSfx, btnClick } from "./audio.js";

export function activateActionbarInput(state, ui) {
  ui.actionBarEl.addEventListener("keydown", (e) => {
    console.log("inside", e.key);
    let active = document.activeElement;

    let actionButtons = ui.actionBarEl.querySelectorAll("button");
    const current = Number(active.dataset.index);

    let next = current;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      playSfx(btnClick, 0.5, 0);

      next = (current + 1) % actionButtons.length;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      playSfx(btnClick, 0.5, 0);

      next = (current - 1 + actionButtons.length) % actionButtons.length;
    }

    if (e.key === "z") {
      e.preventDefault();
      playSfx(btnClick, 0.5, 0);

      const actionButtons = [...ui.actionBarEl.querySelectorAll("button")];

      const foundElement = actionButtons.find((btn) => {
        return btn.dataset.index === String(current);
      });

      console.log(foundElement.dataset.action);
      // ui.actionBarEl.tabIndex = -1;
      doAction(state, ui, foundElement.dataset.action);
      return;
    }

    actionButtons[next].focus();
  });
}

export function setDisabled(btn, disabled) {
  btn.setAttribute("button-disabled", String(disabled));
}
