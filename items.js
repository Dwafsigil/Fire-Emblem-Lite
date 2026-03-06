import { playAndRemove } from "./helpers.js";
import { Phase } from "./state.js";
import { showUnitInfo } from "./unitStatsUI.js";
export const items = {
  potion: {
    id: "potion",
    name: "Health Potion",
    type: "consumable",
    heal: 20,
    description: `Heal selected unit for 20 hp.`,
    image: "assets/potions/potions1.png",
    top: 76,
    left: 76,
    height: 25,
  },
  bronzeSword: {
    id: "bronzeSword",
    name: "Bronze Sword",
    type: "weapon",
    bonuses: { strength: 2 },
    description: "The hard-working man's blade.",
    image: "assets/weapons/bronzeSword.png",
    top: 84,
    left: 84,
    height: 12,
  },
  heroSword: {
    id: "heroSword",
    name: "Hero Sword",
    type: "weapon",
    bonuses: {
      strength: 10,
      defense: 5,
      resistance: 5,
      skill: 10,
      luck: 10,
      speed: 10,
      movement: 2,
    },
    description: "Blesses the user the with god-like combat prowess.",
    image: "assets/weapons/heroSword.png",
    top: 84,
    left: 84,
    height: 12,
  },
  runeRapier: {
    id: "runeRapier",
    name: "Rune Rapier",
    type: "weapon",
    bonuses: {
      skill: 30,
    },
    description:
      "Slender blade, perfect for finding gaps in heavy plate armor.",
    image: "assets/weapons/runeRapier.png",
    top: 84,
    left: 84,
    height: 12,
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
    // state.selectedUnit.updateHealthValue(state.selectedUnit)
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
  showUnitInfo(state, ui);

  ui.description.classList.add("hidden");
  gates[Phase.PLAYER_ITEM].open();
}
