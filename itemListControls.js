import { items } from "./items.js";
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

      if (foundElement.dataset.id === "potion") {
        console.log(state.selectedUnit.health);
        console.log(state.selectedUnit.maxHealth);
        console.log(state.selectedUnit.inventory);

        state.selectedUnit.health += items["potion"].heal;

        if (
          Number(state.selectedUnit.health) >
          Number(state.selectedUnit.maxHealth)
        ) {
          state.selectedUnit.health = state.selectedUnit.maxHealth;
        }
        state.selectedUnit.updateHealthValue(state.selectedUnit);
        state.selectedUnit.updateHealthBar();
        ui.unitHealthStat.textContent = `HP: ${state.selectedUnit.health}`;
        ui.itemList.removeChild(foundElement);

        const index = state.selectedUnit.inventory.findIndex(
          (item) => item.id === "potion",
        );
        state.selectedUnit.inventory.splice(index, 1);
        console.log(state.selectedUnit.inventory);

        // ui.boardEL.focus();
        gates[Phase.PLAYER_ACTION].open();
        return;
        // console.log("healed");
      }
    }

    buttons[next].focus();
  });
}
