import { runBattle } from "./turn.js";
import { Phase } from "./state.js";
import { initDialogue } from "./dialogue.js";
import { placeUnits } from "./unitsView.js";

export async function runGame(state, ui, gates) {
  await gates[Phase.MENU].wait();
  // placeUnits(state, ui, state.units);

  // initDialogue(ui);
  // await gates[Phase.DIALOGUE].wait();
  await runBattle(state, ui, gates);
  ui.boardEl.focus();
  state.phase = Phase.GAME_OVER;
}
