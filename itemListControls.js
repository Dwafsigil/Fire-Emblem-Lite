import { useItem } from "./items.js";
import { Phase } from "./state.js";
import { items } from "./items.js";
import { showUnitInfo, showStats } from "./unitStatsUI.js";
import { playSfx } from "./audio.js";
import { btnClick } from "./audio.js";
// import { openActionBar } from "./uiControls.js";

export function itemListControls(ui, state, gates) {
  ui.itemList.addEventListener("keydown", (e) => {
    // references the active button, can do active.dataset
    let active = document.activeElement;

    let itemButtons = ui.itemList.querySelectorAll("button");
    const current = Number(active.dataset.index);

    let next = current;

    // if (state.Phase === Phase.PLAYER_ITEM) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      next = (current + 1) % itemButtons.length;
      playSfx(btnClick, 0.5, 0);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      next = (current - 1 + itemButtons.length) % itemButtons.length;
      playSfx(btnClick, 0.5, 0);
    }

    if (e.key === "z") {
      e.preventDefault();

      const itemButtons = [...ui.itemList.querySelectorAll("button")];

      const foundElement = itemButtons.find((btn) => {
        return btn.dataset.index === String(current);
      });

      const item = foundElement.dataset.id;

      if (state.selectedUnit.hasAction === false) {
        if (items[item].type === "consumable") {
          return;
        }
      }

      if (items[foundElement.dataset.id].type === "weapon") {
        // Handles equipping weapon / using item
        if (
          state.selectedUnit.equipped &&
          state.selectedUnit.equipped === foundElement.dataset.id
        ) {
          playSfx(btnClick, 0.5, 0);

          // remove item
          // foundElement.style.color = "black";

          // Equip indicator
          const equipIndicator = foundElement.querySelector(".equip-indicator");
          foundElement.removeChild(equipIndicator);

          // remove stats
          for (const [stat, value] of Object.entries(
            items[state.selectedUnit.equipped].bonuses,
          )) {
            state.selectedUnit[stat] -= value;
          }

          state.selectedUnit.equipped = null;

          showStats(state, ui, state.selectedUnit);

          const el = document.createElement("li");
          // el.textContent = `${state.selectedUnit.name} unequipped ${items[foundElement.dataset.id].name}`;
          ui.combatLog.appendChild(el);
          ui.combatLog.scrollTop = ui.combatLog.scrollHeight;

          // showUnitInfo(state, ui);
        } else {
          // equip item
          playSfx(btnClick, 0.5, 0);

          // foundElement.style.color = "blue";
          state.selectedUnit.equipped = foundElement.dataset.id;
          // hard coded but remove stats according to item

          // Iterable way of applying buffs to unit stats
          for (const [stat, value] of Object.entries(
            items[state.selectedUnit.equipped].bonuses,
          )) {
            state.selectedUnit[stat] += value;
          }

          // Equip Indicator
          const equipIndicator = document.createElement("span");

          // el.style.color = "blue";
          equipIndicator.classList.add("equip-indicator");

          equipIndicator.textContent = "[E]";

          foundElement.appendChild(equipIndicator);

          // state.selectedUnit.strength += 2;
          showStats(state, ui, state.selectedUnit);
          // const el = document.createElement("li");
          // el.textContent = `${state.selectedUnit.name} equipped ${items[foundElement.dataset.id].name}`;
          // ui.combatLog.appendChild(el);
        }
      } else {
        if (state.selectedUnit.hasWait) {
          playSfx(btnClick, 0.5, 0);

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
      // openActionBar(ui.actionBarEl);
      playSfx(btnClick, 0.5, 0);

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
