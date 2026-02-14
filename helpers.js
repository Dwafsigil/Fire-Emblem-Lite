import { delay } from "./turn.js";

export function playAndRemove(el) {
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

export async function showCondition(ui) {
  ui.winCondition.classList.remove("hidden");

  await delay(3000);

  ui.winCondition.classList.add("hidden");
}
