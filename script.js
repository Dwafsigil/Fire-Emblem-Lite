import { unitStats } from "./unitStats.js";

// Phase Variables ------------------------
const Phase = {
  PLAYER_SELECT: "player_select",
  PLAYER_ACTION: "player_action",
  ENEMY_TURN: "enemy_turn",
};
let phase = Phase.PLAYER_SELECT;

// Referencing UI ------------------------
const board = document.querySelector(".board");
const actionBar = document.querySelector(".action-bar");
const btns = Array.from(document.querySelectorAll("button"));
// console.log(btns);
const actionButtons = {
  attack: actionBar.querySelector(`[data-action="attack"]`),
  ability: actionBar.querySelector(`[data-action="ability"]`),
  item: actionBar.querySelector(`[data-action="item"]`),
  wait: actionBar.querySelector(`[data-action="wait"]`),
};

// Turn Logic Variables ------------------------
let currentUnitsQueue = [];
let playedUnits = [];

//  All Obstacles -------------------------
let obstacles = [];

// Board Dimensions -------------------------
const row = 8;
const col = 8;

// Holds Current hover position -------------------------
const hover = { row: 0, col: 0 };

// Holds all highlighted tiles
let highTile = [];

// Player related variables -------------------------
let playerSelected = false;
let selectedUnit;
let playerTurn = true;
let allUnits = [
  new unitStats({
    playerId: 0,
    name: "Johnny",
    unitType: "Knight_1",
    affiliation: 0,
    row: 1,
    col: 1,
  }),
  new unitStats({
    playerId: 1,
    name: "Abram",
    unitType: "Knight_1",
    affiliation: 0,
    row: 2,
    col: 3,
    strength: 15,
  }),
  new unitStats({
    playerId: 2,
    name: "Tyler",
    unitType: "Knight_2",
    affiliation: 1,
    row: 3,
    col: 4,
  }),
];
const gates = {
  [Phase.PLAYER_SELECT]: makeGate(),
  [Phase.PLAYER_ACTION]: makeGate(),
  [Phase.ENEMY_TURN]: makeGate(),
};
async function runBattle() {
  initGame();

  while (true) {
    initPlayerTurn();
    while (hasPlayableUnits()) {
      // Player Select
      phase = Phase.PLAYER_SELECT;
      await gates[Phase.PLAYER_SELECT].wait();
      console.log("Finished Player_Select");
      if (!checkAdjacent()) {
        console.log("No adjacent");
        actionButtons.attack.disabled = true;
      }
      openActionBar();

      // Player Action
      phase = Phase.PLAYER_ACTION;
      await gates[Phase.PLAYER_ACTION].wait();

      closeActionBar();
      focusBoard();
      updatePlayable(selectedUnit);
      selectedUnit = null;
      actionButtons.attack.disabled = false;
    }
    playerTurn = false;

    phase = Phase.ENEMY_TURN;
    await runEnemyTurn(); // ← waits until enemy finished
    playerTurn = true;
    console.log("No code for this yet lol");
    if (isBattleOver()) break;
  }
}

function isBattleOver() {}

async function runEnemyTurn() {
  console.log("inside the runEnemyTurn");
  await initEnemyTurn();
}

function makeGate() {
  let resolve = null;
  return {
    wait: () =>
      new Promise((res) => {
        resolve = res;
      }),
    done: (v) => {
      resolve?.(v);
      resolve = null;
    },
  };
}

console.log(allUnits);

// Action Buttons
let i = btns.findIndex((b) => b.tabIndex == 0);
if (i < 0) {
  i = 0;
  btns[0].tabIndex = 0;
}

function setActive(index = 0) {
  const enabled = btns.filter((b) => !b.disabled);
  enabled.forEach((b, j) => (b.tabIndex = j == index ? 0 : -1));
  btns[index].focus();
}

function nextIndex(from, dir) {
  let n = from;
  let l = btns.length;
  do {
    n = (n + dir + l) % l;
  } while (btns[n].disabled && n !== from);
  return n;
}

function openActionBar() {
  actionBar.classList.remove("hidden");
  setActive(i);
}

function closeActionBar() {
  actionBar.classList.add("hidden");
}

function initGame() {
  createBoard(row, col);
  // createPlayerNode(allUnits);

  placeUnits(allUnits);
  updateObstacle();
  // highlightMove(5, 4, 2);
  // placePlayer(5, 4);
  showHoverAt(0, 0);
  board.focus();
}

// let enemy = [];

// console.log(allUnits[1]);

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

// Pulls tile from board
function tileAt(row, col) {
  return board.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
}

// Shows the hover with a border
function showHoverAt(r, c) {
  if (!inBounds) return false;
  hover.row = r;
  hover.col = c;
  const t = tileAt(r, c);
  if (t && !t.classList.contains("hover")) t.classList.add("hover");
}

// Remove the hover
function removeHover() {
  const t = tileAt(hover.row, hover.col);
  t.classList.remove("hover");
}

// function moveHover(dr, dc) {
//   const r = hover.row + dr;
//   const c = hover.col + dc;
//   if (inBounds(r, c) && highlightBounds(r, c) && !playerSelected)
//     showHoverAt(r, c);
//   // if (inBounds(r, c) && highlightBounds(r, c)) showHoverAt(r, c);
// }

function moveHover(dr, dc) {
  const r = hover.row + dr;
  const c = hover.col + dc;

  if (!inBounds(r, c)) return false;
  if (playerSelected) {
    if (!highlightBounds(r, c)) return false;
    if (obstacle(r, c)) return false;
  }

  showHoverAt(r, c);
  return true;
}

// && !obstacle(r, c)

function checkAdjacent() {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dR, dC] of directions) {
    const newRow = selectedUnit.row + dR;
    const newCol = selectedUnit.col + dC;
    if (enemyNear(newRow, newCol)) {
      return true;
    }
    // return false;
  }
  return false;
  // return;
}

function updateObstacle() {
  obstacles = allUnits.map((e) => [e.row, e.col]);
  console.log("updateObstacle");

  // console.log(obstacles);
}

function obstacle(r, c) {
  // console.log(obstacle);
  return allUnits.some((e) => e.row == r && e.col == c && e !== selectedUnit);
}

// Player Move
// const playerNode = document.createElement("div");
// playerNode.className = "player";

function inBounds(r, c) {
  return r >= 0 && r < row && c >= 0 && c < col;
}

function placePlayer(r, c) {
  if (!inBounds(hover.row, hover.col)) return false;
  selectedUnit.row = r;
  selectedUnit.col = c;
  const t = tileAt(r, c);
  // console.log(selectedUnit.node);
  t.appendChild(selectedUnit.node);
}

function movePlayer(dr, dc) {
  const r = selectedUnit.row + dr;
  const c = selectedUnit.col + dc;
  if (
    inBounds(r, c) &&
    highlightBounds(r, c) &&
    playerSelected &&
    !obstacle(r, c)
  )
    placePlayer(r, c);
  // if (inBounds(r, c) && highlightBounds(r, c) ) placePlayer(r, c);
}

// Highlight

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

  console.log("highlightTiles");
  // console.log(highTile);
}

//  Remove Highlighted Tiles
function removeHighlight() {
  for (const [r, c] of highTile) {
    tileAt(r, c).classList.remove("highlight");
  }
}

function clearHighTile() {
  highTile = [];
}

function highlightBounds(r, c) {
  if (highTile.length == 0) return true;
  // console.log(highTile);
  return highTile.some((arr) => arr[0] == r && arr[1] == c);
}

// New Unit Code
function createPlayerNode(unit) {
  const el = document.createElement("div");
  el.className = "player";
  el.id = `player-${unit.playerId}`;
  el.style.setProperty(
    "--sprite-url",
    `url("assets/${unit.unitType}/Idle.png")`
  );
  unit.node = el;
  return el;
}

function placeUnits(units) {
  for (const unit of units) {
    const t = tileAt(unit.row, unit.col);
    const el = createPlayerNode(unit);
    t.appendChild(el);
  }
}

function enemyAt(r, c) {
  if (playerTurn == true) {
    return allUnits.find(
      (u) => u.row === r && u.col === c && u.affiliation === 1
    );
  }
}

function enemyNear(r, c) {
  if (enemyAt(r, c) == null) return;
  return true;
}

function unitAt(r, c) {
  // console.log("unitAt");

  return allUnits.find((u) => u.row === r && u.col === c);
}

function isOccupied(r, c) {
  // console.log("isOccupied");

  if (unitAt(r, c) == null) return;
  return true;
}

// function checkForOpposing(){
//   enemyUnits = allUnits.map((e) => [e.row, e.col]);

// }

function initPlayerTurn() {
  currentUnitsQueue = allUnits.filter((u) => u.affiliation == 0);
}

function initEnemyTurn() {
  currentUnitsQueue = allUnits.filter((u) => u.affiliation == 1);
}

function updatePlayable(unit) {
  if (playerTurn) {
    if (playerSelected) {
      currentUnitsQueue = currentUnitsQueue.filter(
        (u) => u.playerId !== unit.playerId
      );
    }

    console.log(currentUnitsQueue);
  }
}

function checkPlayable(unit) {
  console.log(currentUnitsQueue);
  console.log(unit);
  return currentUnitsQueue.some((e) => e.playerId == unit.playerId);
}

function endTurn() {
  if (currentUnitsQueue.length == 0) {
    if (playerTurn) {
      playerTurn = false;
    } else {
      playerTurn = true;
    }
  }
}

function hasPlayableUnits() {
  return currentUnitsQueue.length > 0;
}

// Event Listeners

// To move Hover and Player with Arrow Keys
board.addEventListener("keydown", (e) => {
  console.log(e.key);
  const moves = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowRight: [0, 1],
    ArrowLeft: [0, -1],
  };

  if (moves[e.key]) {
    e.preventDefault();
    removeHover();
    moveHover(...moves[e.key]);
    // console.log(`${hover.row}:${hover.col}`);
    if (playerSelected) {
      // console.log("pie");
      movePlayer(...moves[e.key]);
      // removeNode(hover.row, hover.col);
      // removeHighlight();
      // if (tempMovement !== 0) {
      //   highlightMove(state.player.row, state.player.col, (tempMovement -= 1));
      // }
    }
  }
});

updatePlayable();
console.log(currentUnitsQueue);

// console.log(currentUnitsQueue);

// CHANGE THIS UP
// Select and Deslect Player with Space
board.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (phase !== Phase.PLAYER_SELECT) return;
  // t = tileAt(hover.row, hover.col);
  // if (!isOccupied(hover.row, hover.col)) return;
  if (e.key == " " && isOccupied(hover.row, hover.col) && !playerSelected) {
    selectedUnit = unitAt(hover.row, hover.col);
    if (checkPlayable(selectedUnit)) {
      playerSelected = true;
      updatePlayable(selectedUnit);
      // console.log(checkPlayable());
      console.log(currentUnitsQueue);

      // console.log(selectedUnit);
      highlightMove(selectedUnit.row, selectedUnit.col, selectedUnit.movement);
      return;
      // console.log("hehe");
    }
  }
  if (e.key == " " && playerSelected == true) {
    removeHighlight();
    clearHighTile();
    // selectedUnit = null;
    playerSelected = false;
    updateObstacle();
    console.log("Deselected Unit");
    gates[Phase.PLAYER_SELECT].done();
  }
});

// actionButtons.attack.disabled = true;
actionBar.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "ArrowRight") {
    i = nextIndex(i, 1);
    setActive(i);
  }
});

actionBar.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "ArrowLeft") {
    i = nextIndex(i, -1);
    setActive(i);
  }
});

actionBar.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == " ") {
    console.log("Space");
    const btn = e.target.closest(`button[data-action]`);
    doAction(btn.dataset.action);
  }
});

actionBar.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Space");
  const btn = e.target.closest(`button[data-action]`);
  if (!btn) return false;
  doAction(btn.dataset.action);
});

// board.addEventListener("keydown"){
//   e.preventDefault();
//   if(doAction)
// }

let isTargeting = false;
let unitHighlighted = false;
let receivingUnit;

function attack() {
  if (!receivingUnit) return false;
  selectedUnit.attackPlayer(receivingUnit);
}

function attackedUnit(r, c) {
  let matches;
  // console.log(r, c);
  // console.log(allUnits);
  matches = allUnits.filter((u) => u.row === r && u.col === c);
  receivingUnit = matches[0];
  // console.log(receivingUnit);
  // selectedUnit.attackPlayer(receivingUnit);
}

function attackHighlight() {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dR, dC] of directions) {
    const newRow = selectedUnit.row + dR;
    const newCol = selectedUnit.col + dC;
    tileAt(newRow, newCol).classList.add("attack");
  }
}

function removeAttackHighlight() {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dR, dC] of directions) {
    const newRow = selectedUnit.row + dR;
    const newCol = selectedUnit.col + dC;
    tileAt(newRow, newCol).classList.remove("attack");
  }
}

function confirmHighlight(r, c) {
  tileAt(r, c).classList.add("attack-confirm");
}

function removeConfirmHiglight() {
  if (!receivingUnit) return false;
  tileAt(receivingUnit.row, receivingUnit.col).classList.remove(
    "attack-confirm"
  );
}

board.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (!isTargeting) return false;
  switch (e.key) {
    case "ArrowUp":
      if (enemyAt(selectedUnit.row - 1, selectedUnit.col))
        confirmHighlight(selectedUnit.row - 1, selectedUnit.col);
      attackedUnit(selectedUnit.row - 1, selectedUnit.col);
      break;
    case "ArrowDown":
      if (enemyAt(selectedUnit.row + 1, selectedUnit.col))
        confirmHighlight(selectedUnit.row + 1, selectedUnit.col);
      attackedUnit(selectedUnit.row + 1, selectedUnit.col);
      break;
    case "ArrowRight":
      if (enemyAt(selectedUnit.row, selectedUnit.col + 1))
        confirmHighlight(selectedUnit.row, selectedUnit.col + 1);
      attackedUnit(selectedUnit.row, selectedUnit.col + 1);
      break;
    case "ArrowLeft":
      if (enemyAt(selectedUnit.row, selectedUnit.col - 1))
        confirmHighlight(selectedUnit.row, selectedUnit.col - 1);
      attackedUnit(selectedUnit.row, selectedUnit.col - 1);
      break;
  }

  unitHighlighted = true;
});

board.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (unitHighlighted == false) return false;
  if (receivingUnit == null) return false;
  if (e.key == " ") {
    attack();
    removeAttackHighlight();
    removeConfirmHiglight();
    receivingUnit = null;
    unitHighlighted = false;
    isTargeting = false;
    gates[Phase.PLAYER_ACTION].done();
  }
});

function doAction(action) {
  switch (action) {
    case "attack":
      console.log("attack");
      isTargeting = true;
      attackHighlight();
      focusBoard();
      break;
    case "ability":
      console.log("ability");

      break;
    case "item":
      console.log("item");

      break;
    case "wait":
      console.log("wait");
      selectedUnit.playerWait();
      gates[Phase.PLAYER_ACTION].done();

      break;
  }
}

function focusBoard() {
  board.focus();
}

// SWAP FOCUS TO ACTIONBAR
// board.addEventListener("keydown", (e) => {
//   if (e.key == "p") {
//     openActionBar();
//   }
// });

runBattle();

// openActionBar();
