export const items = {
  potion: {
    id: "potion",
    name: "Health Potion",
    type: "consumable",
    heal: 5,
  },
};

export function useItem(state, ui, foundElement) {
  if (foundElement.dataset.id === "potion") {
    state.selectedUnit.health += items["potion"].heal;

    if (
      Number(state.selectedUnit.health) > Number(state.selectedUnit.maxHealth)
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
  }
}
