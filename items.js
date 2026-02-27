import { playAndRemove } from "./helpers.js";
import { Phase } from "./state.js";
export const items = {
  potion: {
    id: "potion",
    name: "Health Potion",
    type: "consumable",
    heal: 5,
    description: "Heal selected unit for 5 hp.",
    image: "assets/potions/potions1.png",
  },
  ironSword: {
    id: "ironSword",
    name: "Iron Sword",
    type: "weapon",
    bonuses: { strength: 2 },
    description: "+2 Physical Attack Damage",
  },
};

export function useItem(state, ui, gates, foundElement) {
  if (foundElement.dataset.id === "potion") {
    state.selectedUnit.health += items["potion"].heal;

    // battle log
    const el = document.createElement("li");
    el.textContent = `${state.selectedUnit.name} uses a ${items["potion"].name}`;
    ui.combatLog.appendChild(el);

    if (
      Number(state.selectedUnit.health) > Number(state.selectedUnit.maxHealth)
    ) {
      state.selectedUnit.health = state.selectedUnit.maxHealth;
    }
    state.selectedUnit.updateHealthValue(state.selectedUnit);
    state.selectedUnit.updateHealthBar();
    ui.unitHealthStat.textContent = `HP: ${state.selectedUnit.health}`;
    ui.itemList.removeChild(foundElement);

    const floatingValue = document.createElement("div");
    floatingValue.classList.add("floating-value");

    floatingValue.textContent = `${Number(items["potion"].heal)}`;
    floatingValue.style.setProperty("--float-color", "green");

    state.selectedUnit.node.appendChild(floatingValue);

    playAndRemove(floatingValue);

    const index = state.selectedUnit.inventory.findIndex(
      (item) => item.id === "potion",
    );
    state.selectedUnit.inventory.splice(index, 1);
  }

  ui.description.classList.add("hidden");
  gates[Phase.PLAYER_ITEM].open();
}
