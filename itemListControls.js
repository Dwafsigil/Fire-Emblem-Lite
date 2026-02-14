import { useItem } from "./items.js";
import { Phase } from "./state.js";
import { items } from "./items.js";

export function itemListControls(ui, state, gates) {
  ui.itemList.addEventListener("keydown", (e) => {
    // references the active button, can do active.dataset
    let active = document.activeElement;
    console.log(active);

    let itemButtons = ui.itemList.querySelectorAll("button");
    const current = Number(active.dataset.index);

    let next = current;
    // if (state.Phase === Phase.PLAYER_ITEM) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      next = (current + 1) % itemButtons.length;

      // to find current button
      active = document.activeElement;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      next = (current - 1 + itemButtons.length) % itemButtons.length;

      // const itemButtons = [...ui.itemList.querySelectorAll("button")];

      // const foundElement = itemButtons.find((btn) => {
      //   return btn.dataset.index === String(current);
      // });
      // console.log(foundElement);
    }

    if (e.key === "z") {
      e.preventDefault();

      const itemButtons = [...ui.itemList.querySelectorAll("button")];

      const foundElement = itemButtons.find((btn) => {
        return btn.dataset.index === String(current);
      });

      useItem(state, ui, foundElement);

      // ITEM MARKER

      ui.description.classList.add("hidden");
      gates[Phase.PLAYER_ITEM].open();

      return;
    }
    const currentID = active.dataset.id;

    const itemDescription = items[currentID].description;

    ui.description.textContent = `${itemDescription}`;
    itemButtons[next].focus();
    // }
  });
}
