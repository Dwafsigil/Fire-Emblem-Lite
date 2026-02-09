// movement rules

import { tileAt } from "./board.js";
import { state } from "./script.js";
import { inBounds } from "./board.js";
import { placePlayer } from "./unitsView.js";
// ✅ maybe check again
export function highlightMove(
  state,
  boardEl,
  row,
  col,
  startRow,
  startCol,
  moveRange,
  highTile,
) {
  updateObstacle(state);
  highTile.length = 0;
  const reachable = new Set();
  const queue = [[startRow, startCol, moveRange]];
  const visited = new Set();

  while (queue.length > 0) {
    const [r, c, movementLeft] = queue.shift();
    reachable.add(`${r},${c}`);
    if (movementLeft === 0) continue;

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dR, dC] of directions) {
      const newRow = r + dR;
      const newCol = c + dC;
      const key = `${newRow},${newCol}`;
      if (ifObstacle(state.obstacles, newRow, newCol)) continue;

      if (
        newRow >= 0 &&
        newRow < row &&
        newCol >= 0 &&
        newCol < col &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push([newRow, newCol, movementLeft - 1]);
      }
    }
  }

  for (const key of reachable) {
    let [r, c] = key.split(",").map(Number);
    highTile.push([r, c]);
    if (ifObstacle(state.obstacles, r, c)) continue;
    tileAt(boardEl, r, c).classList.add("highlight");
  }
  // console.log("highTile in highlightMove", highTile);
}

// ✅
export function removeHighlight(boardEl, highTile) {
  for (const [r, c] of highTile) {
    tileAt(boardEl, r, c).classList.remove("highlight");
  }
  // console.log("removeHighlight");
}

// ✅
export function clearHighTile(highTile) {
  highTile.length = 0;
}

// ✅
export function highlightBounds(highTile, r, c) {
  if (highTile.length == 0) return true;

  return highTile.some((arr) => arr[0] == r && arr[1] == c);
}

// ✅ maybe good??
export function updateObstacle(state) {
  let unitObstacles = state.units.map((e) => [e.row, e.col]);
  if (state.playerSelected) {
    unitObstacles = state.units
      .filter((e) => e.affiliation == 1)
      .map((e) => [e.row, e.col]);
    state.obstacles = [...unitObstacles, ...state.mapObstacles];
  } else {
    state.obstacles = [...unitObstacles, ...state.mapObstacles];
  }
}
// ✅
export function ifObstacle(obstacles, r, c) {
  return obstacles.some((e) => e[0] == r && e[1] == c);
}

// ✅
export function movePlayer(state, ui, dr, dc) {
  const r = state.selectedUnit.row + dr;
  const c = state.selectedUnit.col + dc;
  if (
    inBounds(state.board.rows, state.board.cols, r, c) &&
    highlightBounds(state.highTile, r, c) &&
    state.playerSelected &&
    !ifObstacle(state.obstacles, r, c)
  )
    placePlayer(state, ui, r, c);
}
