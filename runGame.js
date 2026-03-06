import { runBattle } from "./turn.js";
import { Phase } from "./state.js";
import { initDialogue } from "./dialogue.js";
import { placeUnits } from "./unitsView.js";
import { menuBGM, playMenu, stopMusic } from "./audio.js";

export async function runGame(state, ui, gates) {
  await gates[Phase.MENU].wait();

  await runBattle(state, ui, gates);
  ui.boardEl.focus();
  state.phase = Phase.GAME_OVER;
  // initDialogue(ui);
}
