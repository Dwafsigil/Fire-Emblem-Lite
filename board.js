// game board stuff

// create the board based on specified rows and cols
export function createBoard(state, boardEl, rows, cols) {
  state.board.grid = [];

  for (let r = 0; r < rows; r++) {
    state.board.grid[r] = [];

    for (let c = 0; c < cols; c++) {
      state.board.grid[r][c] = {
        terrain: "grass",
      };
    }
  }

  for (const [type, coords] of Object.entries(state.obstacleTypes)) {
    for (const [r, c] of coords) {
      const tile = state.board.grid[r][c];

      tile.terrain = type;
    }
  }

  // Essentially creating a temporary variable
  const frag = document.createDocumentFragment();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = document.createElement("div");
      tile.className = "tile" + ((r + c) % 2 == 0 ? "" : " alt");
      tile.dataset.row = String(r);
      tile.dataset.col = String(c);
      frag.appendChild(tile);
    }
  }
  boardEl.appendChild(frag);
}

// return  tile at coords ✅
export function tileAt(boardEl, row, col) {
  return boardEl.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
}

// check if coords are in bounds ✅
export function inBounds(rows, cols, r, c) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}
