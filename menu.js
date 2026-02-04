export function renderMenu(state, ui) {
  ui.startCover.classList.toggle("hidden", state.currentMenu !== "main");
  ui.controls.classList.toggle("hidden", state.currentMenu !== "controls");
  ui.credits.classList.toggle("hidden", state.currentMenu !== "credits");
}
