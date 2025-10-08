const row = 8;
const col = 8;

// Holds current state of the player, position
const state = {
  player: { row: 0, col: 0 },
};

const hover = { row: 0, col: 0 };

const highTile = [];

const board = document.querySelector(".board");

let playerSelected = false;

// Create 8x8 board
function createBoard(row, col) {
  // Essentially creating a temporary variable
  const frag = document.createDocumentFragment();

  for (let r = 0; r < row; r++) {
    for (let c = 0; c < col; c++) {
      const tile = document.createElement("div");
      tile.className = "tile" + ((r + c) % 2 == 0 ? "" : " alt");
      tile.dataset.row = String(r);
      tile.dataset.col = String(c);
      frag.appendChild(tile);
    }
  }
  board.appendChild(frag);
}

function tileAt(row, col) {
  return board.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
}

// Hover Border
function showHoverAt(r, c) {
  if (!inBounds) return false;
  hover.row = r;
  hover.col = c;
  const t = tileAt(r, c);
  if (t && !t.classList.contains("hover")) t.classList.add("hover");
}

function removeHover() {
  const t = tileAt(hover.row, hover.col);
  t.classList.remove("hover");
}

function moveHover(dr, dc) {
  const r = hover.row + dr;
  const c = hover.col + dc;
  if (inBounds(r, c)) showHoverAt(r, c);
}

// Player Move
const playerNode = document.createElement("div");
playerNode.className = "player";

function inBounds(r, c) {
  return r >= 0 && r < row && c >= 0 && c < col;
}

function placePlayer(r, c) {
  if (!inBounds) return false;
  state.player.row = r;
  state.player.col = c;
  const t = tileAt(r, c);
  if (t && !t.contains(playerNode)) t.appendChild(playerNode);
}

function movePlayer(dr, dc) {
  const r = state.player.row + dr;
  const c = state.player.col + dc;
  if (inBounds(r, c)) placePlayer(r, c);
}

// Highlight possible moves
function highlightMove(startRow, startCol, moveRange) {
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
    tileAt(r, c).classList.add("highlight");
  }

  // console.log(highTile);
}

//  Remove Highlighted Tiles
function removeHighlight() {
  for (const [r, c] of highTile) {
    tileAt(r, c).classList.remove("highlight");
  }
}

// Event Listeners

// To move Hover and Player
board.addEventListener("keydown", (e) => {
  const moves = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowRight: [0, 1],
    ArrowLeft: [0, -1],
  };

  if (moves[e.key]) {
    e.preventDefault;
    removeHover();
    moveHover(...moves[e.key]);
    // console.log(`${hover.row}:${hover.col}`);
    if (playerSelected) movePlayer(...moves[e.key]);
  }
});

// To select player
board.addEventListener("keydown", (e) => {
  e.preventDefault;

  if (e.key == " ") {
    if (state.player.col == hover.col && state.player.row == hover.row) {
      playerSelected = !playerSelected;
      // console.log("hehe");
    }

    if (!playerSelected && highTile.length > 0) removeHighlight();
    if (playerSelected) {
      highlightMove(state.player.row, state.player.col, 2);
      console.log(highTile);
    }
    // removeHighlight();
  }
});

createBoard(row, col);
// highlightMove(5, 4, 2);
placePlayer(5, 4);
showHoverAt(0, 0);
board.focus();
