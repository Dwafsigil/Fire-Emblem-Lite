import { Phase } from "./state.js";
import { attackHighlight } from "./combatInput.js";
// import { focusBoard } from "./uiControls.js";
import { skills } from "./skills.js";
// import { openActionBar } from "./uiControls.js";

export function skillListControls(ui, state, gates) {
  ui.skillList.addEventListener("keydown", (e) => {
    // references the active button, can do active.dataset
    let active = document.activeElement;

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

      // Confirm ability with Z
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
        ui.boardEl.focus();
        // focusBoard(ui.boardEl);
        ui.description.classList.add("hidden");

        // skill marker

        return;
      }

      if (
        state.phase === Phase.PLAYER_SKILL &&
        !state.attackOn &&
        e.key === "x"
      ) {
        console.log("Inside");
        // openActionBar(ui.actionBarEl);
        const firstButton = ui.actionBarEl.querySelector("button");
        firstButton?.focus();
        ui.description.classList.add("hidden");
        gates[Phase.PLAYER_SKILL].cancel();
        return;
      }

      skillButtons[next].focus();

      const currentID = active.dataset.id;

      const skillDescription = skills[currentID].description;

      ui.description.textContent = `${skillDescription}`;
    }
  });
}
