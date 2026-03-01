import { useItem } from "./items.js";
import { Phase } from "./state.js";
import { items } from "./items.js";
import { showUnitInfo, showStats } from "./unitStatsUI.js";
// import { openActionBar } from "./uiControls.js";

export function itemListControls(ui, state, gates) {
  ui.itemList.addEventListener("keydown", (e) => {
    // references the active button, can do active.dataset
    let active = document.activeElement;
    // console.log(active);

    let itemButtons = ui.itemList.querySelectorAll("button");
    const current = Number(active.dataset.index);

    let next = current;

    // console.log(next);

    // console.log(itemDescription);

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

      // Handles equipping weapon / using item
      if (items[foundElement.dataset.id].type === "weapon") {
        if (
          state.selectedUnit.equipped &&
          state.selectedUnit.equipped === foundElement.dataset.id
        ) {
          // remove item
          foundElement.style.color = "black";
          state.selectedUnit.equipped = null;
          // hard coded but add stats according to item
          state.selectedUnit.strength -= 2;
          showStats(state, ui, state.selectedUnit);
          // console.log("unequip");
          const el = document.createElement("li");
          el.textContent = `${state.selectedUnit.name} unequipped ${items[foundElement.dataset.id].name}`;
          ui.combatLog.appendChild(el);
        } else {
          // equip item
          foundElement.style.color = "blue";
          state.selectedUnit.equipped = foundElement.dataset.id;
          // hard coded but remove stats according to item

          state.selectedUnit.strength += 2;
          showStats(state, ui, state.selectedUnit);
          const el = document.createElement("li");
          el.textContent = `${state.selectedUnit.name} equipped ${items[foundElement.dataset.id].name}`;
          ui.combatLog.appendChild(el);

          // console.log("equip");
          // console.log(state.selectedUnit.equipped);
        }
      } else {
        if (state.selectedUnit.hasMove) {
          const firstButton = ui.actionBarEl.querySelector("button");
          firstButton?.focus();
          firstButton.classList.add("buttonGlow");
        }

        ui.itemImage.classList.add("hidden");

        useItem(state, ui, gates, foundElement);
      }

      return;
    }

    if (state.phase === Phase.PLAYER_ITEM && e.key === "x") {
      // console.log("Inside");
      // openActionBar(ui.actionBarEl);
      const firstButton = ui.actionBarEl.querySelector("button");
      firstButton?.focus();
      firstButton.classList.add("buttonGlow");

      ui.skillList.classList.remove("glow");

      ui.description.classList.add("hidden");
      ui.itemImage.classList.add("hidden");

      gates[Phase.PLAYER_ITEM].cancel();
      return;
    }

    itemButtons[next].focus();
    active = document.activeElement;
    let currentID = active.dataset.id;

    let itemDescription = items[currentID].description;
    ui.description.textContent = `${itemDescription}`;
    ui.itemImage.src = `${items[currentID].image}`;
    ui.itemImage.style.setProperty(`--top`, `${items[currentID].top}%`);
    ui.itemImage.style.setProperty(`--left`, `${items[currentID].left}%`);
    ui.itemImage.style.setProperty(`--height`, `${items[currentID].height}%`);

    // ui.characterImage.src = `${items[currentID].image}`;
    // }
  });
}
