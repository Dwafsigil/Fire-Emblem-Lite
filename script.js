const row = 8;
const col = 8;

// Holds current state of the player, position
const state = {
  player: { row: 0, col: 0 },
};

const board = document.querySelector(".board");

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

board.addEventListener("keydown", (e) => {
  e.preventDefault();
  const key = e.key;
  if (key == "ArrowUp") movePlayer(-1, 0);
  if (key == "ArrowDown") movePlayer(1, 0);
  if (key == "ArrowRight") movePlayer(0, 1);
  if (key == "ArrowLeft") movePlayer(0, -1);
});

createBoard(row, col);
placePlayer(0, 0);
board.focus();
