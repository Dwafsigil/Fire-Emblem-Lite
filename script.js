import { unitStats } from "./unitStats.js";
import {
  startMusic,
  playSfx,
  btnClick,
  hoverSound,
  swordHit,
  hurtGrunt,
  deadGrunt,
} from "./audio.js";

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
const actionButtons = {
  attack: actionBar.querySelector(`[data-action="attack"]`),
  ability: actionBar.querySelector(`[data-action="ability"]`),
  item: actionBar.querySelector(`[data-action="item"]`),
  wait: actionBar.querySelector(`[data-action="wait"]`),
};
const phaseText = document.querySelector(".phase");
const turnText = document.querySelector(".turn");

// Turn Logic Variables ------------------------
let currentUnitsQueue = [];
let playedUnits = [];

//  All Obstacles -------------------------
let obstacles = [];
let turnCounter = 1;

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
    strength: 20,
    movement: 1,
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
    movement: 2,
    strength: 20,
  }),
  new unitStats({
    playerId: 2,
    name: "Emi",
    unitType: "Knight_2",
    affiliation: 1,
    row: 5,
    col: 4,
    movement: 1,
    strength: 20,
  }),
];
const gates = {
  [Phase.PLAYER_SELECT]: createGate(),
  [Phase.PLAYER_ACTION]: createGate(),
  [Phase.ENEMY_TURN]: createGate(),
};

// startMusic(1000);

async function runBattle() {
  initGame();

  while (true) {
    try {
      setDisabled(actionButtons.attack, false);
      initPlayerTurn();
      while (hasPlayableUnits()) {
        turnText.textContent = `Turn: ${turnCounter}`;
        // Player Select
        if (isBattleOver()) break;
        phase = Phase.PLAYER_SELECT;
        phaseText.textContent = "Player Select";
        await gates[Phase.PLAYER_SELECT].wait();
        if (!checkAdjacent(selectedUnit)) {
          setDisabled(actionButtons.attack, true);
        }
        console.log("Finished Player_Select");
        // if (!checkAdjacent()) {
        //   setDisabled(actionButtons.attack, true);
        // }
        // openActionBar();

        // Player Action
        phase = Phase.PLAYER_ACTION;
        phaseText.textContent = "Player Action";

        await gates[Phase.PLAYER_ACTION].wait();
        closeActionBar();
        focusBoard();
        updatePlayable(selectedUnit);
        selectedUnit = null;
        setDisabled(actionButtons.attack, false);
        console.log("Finished Player_Action");
        if (isBattleOver()) break;
      }
    } catch (e) {
      if (e == CANCEL) {
        continue;
      }
      throw e;
    }
    playerTurn = false;
    phaseText.textContent = "Enemy Turn";
    await delay(1500);
    phase = Phase.ENEMY_TURN;
    await runEnemyTurn();
    playerTurn = true;
    console.log("Finished Enemy Turn");
    if (isBattleOver()) break;
    turnCounter++;
  }

  console.log("Battle is Over!");
}
// Making Buttons Disabled
function setDisabled(btn, disabled) {
  btn.setAttribute("button-disabled", String(disabled));
}

function isBattleOver() {
  let friendlyUnit = allUnits.filter((e) => e.affiliation == 0);
  let enemyUnit = allUnits.filter((e) => e.affiliation == 1);
  if (friendlyUnit.length == 0 || enemyUnit.length == 0) {
    phaseText.textContent = "Game Over!";
    return true;
  }
  return false;
}

let enemyMoves = [];
let closestFriendly;
let optimalMove;

const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

async function runEnemyTurn() {
  let enemyUnit = allUnits.filter((e) => e.affiliation == 1);
  for (const u of enemyUnit) {
    enemyMoves = [];
    closestFriendly = null;
    optimalMove = [];
    enemyPossibleMoves(u.row, u.col, u.movement);
    findClosestFriendly(u);
    checkOptimalMove();

    if (checkAdjacent(u)) {
      enemyAttack(u);
      if (closestFriendly.checkDead()) removeDead();
    } else {
      enemyMove(u);
      if (checkAdjacent(u)) {
        enemyAttack(u);
        if (closestFriendly.checkDead()) removeDead();
      }
    }

    console.log(`Ran Enemy Turn ${u.name}`);
    await delay(2000);
  }
}

function enemyAttack(enemyUnit) {
  enemyUnit.attackPlayer(closestFriendly);
  if (!closestFriendly.checkDead()) {
    hurtAnimation(closestFriendly);
  }
  attackAnimation(enemyUnit);
}

function enemyMove(enemyUnit) {
  if (!closestFriendly) return;

  const [[r, c]] = optimalMove;

  let t = tileAt(r, c);

  t.appendChild(enemyUnit.node);
  enemyUnit.row = r;
  enemyUnit.col = c;
}

function checkOptimalMove() {
  let closestDistance = 1000;
  let tempDistance;
  if (!closestFriendly) return;
  for (const [r, c] of enemyMoves) {
    tempDistance = Math.sqrt(
      Math.pow(closestFriendly.row - r, 2) +
        Math.pow(closestFriendly.col - c, 2)
    );

    if (tempDistance < closestDistance) {
      closestDistance = tempDistance;
      optimalMove = [[r, c]];
    }
  }
}

function findClosestFriendly(enemyUnit) {
  let friendlyUnit = allUnits.filter((e) => e.affiliation == 0);
  let closestDistance = 1000;
  let tempDistance;
  for (const u of friendlyUnit) {
    tempDistance = Math.sqrt(
      Math.pow(u.row - enemyUnit.row, 2) + Math.pow(u.col - enemyUnit.col, 2)
    );
    if (tempDistance < closestDistance) {
      closestDistance = tempDistance;
      closestFriendly = u;
    }
  }
}
// Get possible moves for an enemy and push into an array. r,c values are pushed in to enemy Moves
function enemyPossibleMoves(startRow, startCol, moveRange) {
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
    if (isOccupied(r, c)) continue;
    enemyMoves.push([r, c]);
    // tileAt(r, c).classList.add("highlight");
  }
}

export const CANCEL = Symbol("CANCEL");

export function createGate() {
  let resolve, reject;
  // one outstanding promise per gate
  let promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const reset = () => {
    promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  };

  return {
    // Wait for this phase to complete; always returns the same promise
    wait() {
      return promise;
    },

    // Resolve the current wait (advance phase)
    open(value) {
      resolve?.(value);
      reset();
    },

    // Reject the current wait (backtrack/abort this phase)
    cancel(reason = CANCEL) {
      reject?.(reason);
      reset();
    },

    // Optional helpers
    isWaiting() {
      return !!resolve;
    }, // true when a wait is in-flight
  };
}

// function makeGate() {
//   let resolve = null;
//   return {
//     wait: () =>
//       new Promise((res) => {
//         resolve = res;
//       }),
//     done: (v) => {
//       resolve?.(v);
//       resolve = null;
//     },
//   };
// }

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

  playSfx(hoverSound, 0.2, 0);
  showHoverAt(r, c);
  return true;
}

async function removeDead() {
  let tempUnit;
  if (playerTurn == true) {
    tempUnit = receivingUnit;
    deadAnimation(receivingUnit);
    // allUnits = allUnits.filter((e) => e !== tempUnit);
    // let t = tileAt(tempUnit.row, tempUnit.col);
    // t.removeChild(tempUnit.node);
    allUnits = allUnits.filter((e) => e !== tempUnit);
    let t = tileAt(tempUnit.row, tempUnit.col);
    setTimeout(() => {
      t.removeChild(tempUnit.node);
    }, 2000);
  } else {
    tempUnit = closestFriendly;
    deadAnimation(closestFriendly);
    // allUnits = allUnits.filter((e) => e !== tempUnit);
    // let t = tileAt(tempUnit.row, tempUnit.col);
    // t.removeChild(tempUnit.node);
    allUnits = allUnits.filter((e) => e !== tempUnit);
    let t = tileAt(tempUnit.row, tempUnit.col);
    setTimeout(() => {
      t.removeChild(tempUnit.node);
    }, 2000);
  }
}

// && !obstacle(r, c)

function checkAdjacent(unit = null) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  if (playerTurn == true) {
    for (const [dR, dC] of directions) {
      const newRow = selectedUnit.row + dR;
      const newCol = selectedUnit.col + dC;
      if (enemyNear(newRow, newCol)) {
        return true;
      }
      // return false;
    }
  } else {
    for (const [dR, dC] of directions) {
      const newRow = unit.row + dR;
      const newCol = unit.col + dC;
      if (enemyNear(newRow, newCol)) {
        return true;
      }
      // return false;
    }
  }
  return false;
  // return;
}

function updateObstacle() {
  obstacles = allUnits.map((e) => [e.row, e.col]);
}

function obstacle(r, c) {
  return allUnits.some((e) => e.row == r && e.col == c && e !== selectedUnit);
}

// Player Move
// const playerNode = document.createElement("div");
// playerNode.className = "player";

function inBounds(r, c) {
  return r >= 0 && r < row && c >= 0 && c < col;
}

function placePlayer(r, c) {
  console.log("placePlayer");
  if (!inBounds(hover.row, hover.col)) return false;
  selectedUnit.row = r;
  selectedUnit.col = c;
  const t = tileAt(r, c);

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
  highTile = [];
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
  if (playerTurn == false) {
    return allUnits.find(
      (u) => u.row === r && u.col === c && u.affiliation === 0
    );
  }
}

function enemyNear(r, c) {
  if (enemyAt(r, c) == null) return false;
  return true;
}

function unitAt(r, c) {
  return allUnits.find((u) => u.row === r && u.col === c);
}

function isOccupied(r, c) {
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
  }
}

function checkPlayable(unit) {
  return currentUnitsQueue.some((e) => e.playerId == unit.playerId);
}

function hasPlayableUnits() {
  return currentUnitsQueue.length > 0;
}

// Event Listeners

// To move Hover and Player with Arrow Keys
board.addEventListener("keydown", (e) => {
  const moves = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowRight: [0, 1],
    ArrowLeft: [0, -1],
  };

  if (attackOn == true) return;
  if (moves[e.key]) {
    e.preventDefault();
    removeHover();
    moveHover(...moves[e.key]);

    if (playerSelected) {
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

let startRow;
let startCol;
// CHANGE THIS UP
// Select and Deslect Player with Space
board.addEventListener("keydown", (e) => {
  console.log("detecting spacebar");
  e.preventDefault();
  if (phase !== Phase.PLAYER_SELECT) return;
  // t = tileAt(hover.row, hover.col);
  // if (!isOccupied(hover.row, hover.col)) return;
  if (e.key == " " && isOccupied(hover.row, hover.col) && !playerSelected) {
    selectedUnit = unitAt(hover.row, hover.col);
    if (checkPlayable(selectedUnit)) {
      startRow = hover.row;
      startCol = hover.col;
      playerSelected = true;
      updatePlayable(selectedUnit);
      highlightMove(selectedUnit.row, selectedUnit.col, selectedUnit.movement);
      playSfx(btnClick, 0.5, 0);

      return;
    }
  }
  if (e.key == " " && playerSelected == true) {
    console.log("Inside deselect");
    removeHighlight();
    clearHighTile();
    // selectedUnit = null;
    playerSelected = false;
    updateObstacle();
    playSfx(btnClick, 0.5, 0);
    openActionBar();
    console.log(selectedUnit.row, selectedUnit.col);
    gates[Phase.PLAYER_SELECT].open(selectedUnit);
    // playSfx(btnClick, 0.5, 0);
  }
});

actionBar.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "ArrowRight") {
    i = nextIndex(i, 1);
    setActive(i);
    playSfx(btnClick, 0.5, 0);
  }
});

actionBar.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "ArrowLeft") {
    i = nextIndex(i, -1);
    setActive(i);
    playSfx(btnClick, 0.5, 0);
  }
});

actionBar.addEventListener("keydown", (e) => {
  e.preventDefault();
  // console.log(e.key);
  if (e.key == " ") {
    const btn = e.target.closest(`button[data-action]`);
    doAction(btn.dataset.action);
    playSfx(btnClick, 0.5, 0);
  }
});

actionBar.addEventListener("click", (e) => {
  e.preventDefault();

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

function playAnim(unit, className, delay) {
  unit.node.classList.remove(className);
  unit.node.style.setProperty(
    "--sprite-url",
    `url("assets/${unit.unitType}/${className}.png")`
  );
  unit.node.classList.add(className);
  setTimeout(() => {
    unit.node.classList.remove(className);
    unit.node.style.setProperty(
      "--sprite-url",
      `url("assets/${unit.unitType}/Idle.png")`
    );
  }, delay);
}

function attackAnimation(unit) {
  playAnim(unit, "attack3", 600);
  playSfx(swordHit, 0.5, 0);
}

function hurtAnimation(unit) {
  playAnim(unit, "hurt", 500);
  playSfx(hurtGrunt, 0.3, 200);
}

async function deadAnimation(unit) {
  unit.node.classList.remove("dead");
  unit.node.style.setProperty(
    "--sprite-url",
    `url("assets/${unit.unitType}/dead.png")`
  );
  unit.node.classList.add("dead");
  playSfx(deadGrunt, 0.2, 200);
  // removeDead();
}

function attack() {
  selectedUnit.attackPlayer(receivingUnit);

  // let tempUnit = selectedUnit;
  if (!receivingUnit) return false;

  attackAnimation(selectedUnit);
  // selectedUnit.node.classList.remove("attack");
  // selectedUnit.attackPlayer(receivingUnit);
}

function attackedUnit(r, c) {
  let matches;
  matches = allUnits.filter(
    (u) => u.row === r && u.col === c && u.affiliation === 1
  );
  receivingUnit = matches[0];

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
    if (tileAt(newRow, newCol) !== null)
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
    if (tileAt(newRow, newCol) !== null)
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
  removeConfirmHiglight();
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

// To attack
board.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (unitHighlighted == false) return false;
  if (receivingUnit == null) return false;
  if (isTargeting == false) return false;
  if (e.key == " ") {
    attack();
    attackOn = false;
    if (receivingUnit.checkDead()) {
      removeDead();
    }
    if (!receivingUnit.checkDead()) {
      hurtAnimation(receivingUnit);
    }

    removeAttackHighlight();
    removeConfirmHiglight();

    receivingUnit = null;
    unitHighlighted = false;
    isTargeting = false;
    playSfx(btnClick, 0.5, 0);

    gates[Phase.PLAYER_ACTION].open();
  }
});

let tempRecievingUnit;
let attackOn = false;
function doAction(action) {
  switch (action) {
    case "attack":
      if (actionButtons.attack.getAttribute("button-disabled") === "true")
        return;
      attackOn = true;
      console.log("attack");
      tempRecievingUnit = receivingUnit;
      console.log("tempRecievingUnit", tempRecievingUnit);
      console.log("playerSelected", receivingUnit);

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
      gates[Phase.PLAYER_ACTION].open("wait");

      break;
  }
}
// When selected a unit
board.addEventListener("keydown", (e) => {
  // console.log(e.key);
  if (e.key == "x") {
    if (playerSelected && phase == "player_select") {
      console.log("Inside board x");
      placePlayer(startRow, startCol);
      currentUnitsQueue.push(selectedUnit);
      playerSelected = false;
      selectedUnit = null;
      // actionButtons.attack.disabled = false;

      removeHighlight();
    }
    if (phase == "player_action") {
      console.log("Inside attack reset");
      removeAttackHighlight();
      removeConfirmHiglight();
      openActionBar();
      attackOn = false;
      isTargeting = false;
      // showHoverAt(selectedUnit.r, selectedUnit.c);
    }
  }
});

// When action bar is pulled up
actionBar.addEventListener("keydown", (e) => {
  // console.log(e.key);
  e.preventDefault();
  if (e.key == "x") {
    if ((playerSelected = true && phase == "player_action")) {
      closeActionBar();
      focusBoard();
      console.log(selectedUnit);
      // highTile = null;
      highlightMove(startRow, startCol, selectedUnit.movement);
      console.log(highTile);
      console.log("Inside X actionbar");
      // phase = phase.PLAYER_SELECT;
      playerSelected = true;
      // actionButtons.attack.disabled = false;

      gates[Phase.PLAYER_ACTION].cancel();
    }
  }
});

// actionBar.addEventListener("keydown", (e) => {
//   e.preventDefault();
//
//   if (e.key == " ") {
//     const btn = e.target.closest(`button[data-action]`);
//     doAction(btn.dataset.action);
//     playSfx(btnClick, 0.5, 0);
//   }
// });

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
