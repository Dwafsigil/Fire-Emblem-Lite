import { useItem } from "./items.js";
import { Phase } from "./state.js";

export function itemListControls(ui, state, gates) {
  ui.itemList.addEventListener("keydown", (e) => {
    // references the active button, can do active.dataset
    const active = document.activeElement;

    let itemButtons = ui.itemList.querySelectorAll("button");
    const current = Number(active.dataset.index);

    let next = current;
    // if (state.Phase === Phase.PLAYER_ITEM) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      next = (current + 1) % itemButtons.length;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      next = (current - 1 + itemButtons.length) % itemButtons.length;
    }

    if (e.key === "z") {
      e.preventDefault();

      const itemButtons = [...ui.itemList.querySelectorAll("button")];

      const foundElement = itemButtons.find((btn) => {
        return btn.dataset.index === String(current);
      });

      useItem(state, ui, foundElement);

      // ITEM MARKER
      gates[Phase.PLAYER_ITEM].open();

      return;
    }

    itemButtons[next].focus();
    // }
  });
}
