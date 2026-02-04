import { runBattle } from "./turn.js";
import { Phase } from "./state.js";

export async function runGame(state, ui, gates) {
  await gates[Phase.MENU].wait();
  runBattle(state, ui, gates);
}
