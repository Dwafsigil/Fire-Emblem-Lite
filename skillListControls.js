import { Phase } from "./state.js";
import { attackHighlight } from "./combatInput.js";
import { focusBoard } from "./uiControls.js";

export function skillListControls(ui, state, gates) {
  ui.skillList.addEventListener("keydown", (e) => {
    // references the active button, can do active.dataset
    const active = document.activeElement;

    const skillButtons = ui.skillList.querySelectorAll("button");
    const current = Number(active.dataset.index);

    let next = current;
    if (state.phase === Phase.PLAYER_SKILL) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        next = (current + 1) % skillButtons.length;

        active = document.activeElement;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        next = (current - 1 + skillButtons.length) % skillButtons.length;
      }

      if (e.key === "z") {
        e.preventDefault();

        const skillButtons = [...ui.skillList.querySelectorAll("button")];

        const foundElement = skillButtons.find((btn) => {
          return btn.dataset.index === String(current);
        });

        state.useSkill = foundElement;

        state.attackOn = true;
        state.isTargeting = true;
        attackHighlight(state, ui);
        focusBoard(ui.boardEl);
        ui.description.classList.add("hidden");

        // skill marker

        return;
      }

      const currentID = active.dataset.id;

      const itemDescription = items[currentID].description;

      ui.description.textContent = `${itemDescription}`;

      skillButtons[next].focus();
    }
  });
}
