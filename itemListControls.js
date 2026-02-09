import { useItem } from "./items.js";
import { Phase } from "./state.js";

export function itemListControls(ui, state, gates) {
  ui.itemList.addEventListener("keydown", (e) => {
    // references the active button, can do active.dataset
    const active = document.activeElement;

    const buttons = ui.itemList.querySelectorAll("button");
    const current = Number(active.dataset.index);

    let next = current;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      next = (current + 1) % buttons.length;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      next = (current - 1 + buttons.length) % buttons.length;
    }

    if (e.key === "z") {
      e.preventDefault();

      const buttons = [...ui.itemList.querySelectorAll("button")];

      const foundElement = buttons.find((btn) => {
        return btn.dataset.index === String(current);
      });

      useItem(state, ui, foundElement);

      gates[Phase.PLAYER_ACTION].open();
      return;
    }

    buttons[next].focus();
  });
}
