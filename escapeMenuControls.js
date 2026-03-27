import { Phase } from "./state.js";

export function escapeMenuControls(ui, state, gates) {
  document.addEventListener("keydown", (e) => {
    e.preventDefault;
    console.log("Pressed");
    if (e.code === "Escape" && state.phase !== Phase.MENU) {
      ui.escapeMenu.classList.toggle("hidden");
      if (!ui.escapeMenu.classList.contains("hidden")) {
        const buttons = ui.escapeMenu.querySelectorAll("button");
        buttons[0].focus();
      }
    }
  });

  ui.escapeMenu.addEventListener("keydown", (e) => {
    let active = document.activeElement;

    let escapeMenuBtns = ui.escapeMenu.querySelectorAll("button");
    const current = Number(active.dataset.index);
    let next = current;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      next = (current + 1) % escapeMenuBtns.length;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      next = (current - 1 + escapeMenuBtns.length) % escapeMenuBtns.length;
    }

    if (e.key === "z") {
      if (current === 0) {
        console.log("This is zero");
        ui.controls.classList.toggle("hidden");
      }
    }

    escapeMenuBtns[next].focus();
  });
}
// Element.classList.contains()
