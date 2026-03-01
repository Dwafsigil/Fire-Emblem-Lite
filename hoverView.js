// hover stuff

import { tileAt } from "./board.js";
import { inBounds } from "./board.js";
import { playSfx, hoverSound } from "./audio.js";
import { highlightBounds } from "./movement.js";
import { ifObstacle } from "./movement.js";

// ✅
export function showHoverAt(state, ui, r, c) {
  if (!inBounds) return false;
  state.hover.row = r;
  state.hover.col = c;
  const t = tileAt(ui.boardEl, r, c);
  if (t && !t.classList.contains("hover")) {
    // t.classList.add("hover");
    t.classList.add("hover");

    console.log(t);
  }
}

// ✅
export function removeHover(state, ui) {
  const t = tileAt(ui.boardEl, state.hover.row, state.hover.col);
  t.classList.remove("hover");
}

// ✅
export function moveHover(state, ui, dr, dc) {
  const r = state.hover.row + dr;
  const c = state.hover.col + dc;

  if (!inBounds(state.board.rows, state.board.cols, r, c)) return false;

  if (state.playerSelected) {
    if (!highlightBounds(state.highTile, r, c)) return false;

    if (ifObstacle(state.obstacles, r, c)) return false;
  }

  playSfx(hoverSound, 0.2, 0);
  showHoverAt(state, ui, r, c);
  return true;
}
