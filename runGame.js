import { runBattle } from "./turn.js";
import { Phase } from "./state.js";
import { initDialogue } from "./dialogue.js";
import { placeUnits } from "./unitsView.js";

export async function runGame(state, ui, gates) {
  await gates[Phase.MENU].wait();

  // console.log(firstUnit);

  await runBattle(state, ui, gates);
  ui.boardEl.focus();
  state.phase = Phase.GAME_OVER;
}
