import { unitStats } from "./unitStats.js";
import {
  bgm,
  startMusic,
  playSfx,
  btnClick,
  hoverSound,
  swordHit,
  hurtGrunt,
  deadGrunt,
} from "./audio.js";

export let consoleContent;
let gameStart = false;
// Phase Variables ------------------------
const Phase = {
  PLAYER_SELECT: "player_select",
  PLAYER_ACTION: "player_action",
  ENEMY_TURN: "enemy_turn",
};
let phase = Phase.PLAYER_SELECT;

// Referencing UI ------------------------
// const bgmMusic = document.querySelector("#bgm");
const resetGame = document.querySelector(".reset-game");
const toggleBGM = document.querySelector(".toggle-bgm");
export let consoleTextField = document.querySelector(".text-container");
export let consoleLog = document.querySelector(".console-log");
const gamePhase = document.querySelector(".current-phase");
const board = document.querySelector(".board");
const actionBar = document.querySelector(".action-bar");
const btns = Array.from(document.querySelectorAll(".action-btn"));
const container = document.querySelector(".container");
const startCover = document.querySelector(".start-cover");
const actionButtons = {
  attack: actionBar.querySelector(`[data-action="attack"]`),
  ability: actionBar.querySelector(`[data-action="ability"]`),
  item: actionBar.querySelector(`[data-action="item"]`),
  wait: actionBar.querySelector(`[data-action="wait"]`),
};
const phaseText = document.querySelector(".phase");
const turnText = document.querySelector(".turn");
const gameOverCover = document.querySelector(".game-over-cover");

// Turn Logic Variables ------------------------
let currentUnitsQueue = [];
let playedUnits = [];

//  All Obstacles -------------------------
let obstacles = [];
let mapObstacles = [
  [1, 0],
  [2, 0],
  [7, 0],
  [8, 0],
  [9, 0],
  [10, 0],
  [11, 0],
  [8, 1],
  [9, 1],
  [10, 1],
  [11, 1],
  [9, 2],
  [10, 2],
  [11, 2],
  [11, 3],
  [4, 4],
  [5, 4],
  [6, 4],
  [4, 5],
  [5, 5],
  [6, 5],
  [4, 6],
  [5, 6],
  [6, 6],
  [1, 9],
  [2, 9],
  [1, 10],
  [2, 10],
];
let turnCounter = 1;

// Board Dimensions -------------------------
const row = 12;
const col = 12;

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
    strength: 3,
    movement: 3,
  }),
  new unitStats({
    playerId: 1,
    name: "Abram",
    unitType: "Knight_1",
    affiliation: 0,
    row: 2,
    col: 3,
    strength: 4,
  }),
  new unitStats({
    playerId: 2,
    name: "Tyler",
    unitType: "Knight_2",
    affiliation: 1,
    row: 8,
    col: 10,
    movement: 5,
    strength: 5,
  }),
  new unitStats({
    playerId: 3,
    name: "Emi",
    unitType: "Knight_2",
    affiliation: 1,
    row: 10,
    col: 8,
    movement: 2,
    strength: 4,
  }),
  new unitStats({
    playerId: 4,
    name: "David",
    unitType: "Knight_2",
    affiliation: 1,
    row: 8,
    col: 7,
    movement: 1,
    strength: 10,
  }),
  new unitStats({
    playerId: 5,
    name: "Esmy",
    unitType: "Knight_1",
    affiliation: 0,
    row: 4,
    col: 1,
    movement: 4,
    strength: 4,
  }),
];

// let allUnits;
const gates = {
  [Phase.PLAYER_SELECT]: createGate(),
  [Phase.PLAYER_ACTION]: createGate(),
  [Phase.ENEMY_TURN]: createGate(),
};

async function runBattle() {
  initGame();
  startMusic(0);
  // allUnits = createdUnits;

  while (true) {
    try {
      console.log("Initlaized Turn");
      setDisabled(actionButtons.attack, false);
      console.log(playerSelected);
      initPlayerTurn();
      showPhase("Player Phase");

      while (hasPlayableUnits()) {
        turnText.textContent = `Turn: ${turnCounter}`;
        // consoleTextField.textContent = "";
        // Player Select
        if (await isBattleOver()) break;
        phase = Phase.PLAYER_SELECT;
        // phaseText.textContent = "Player Select";
        await gates[Phase.PLAYER_SELECT].wait();
        // console.log(player);

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
        // phaseText.textContent = "Player Action";
        updatePlayable(selectedUnit);
        // currentUnitsQueue = currentUnitsQueue.filter(
        //   (e) => e.playerId !== player.playerId
        // );

        // console.log(currentUnitsQueue);

        await gates[Phase.PLAYER_ACTION].wait();
        console.log("After phase action");
        // console.log(playerSelected);
        closeActionBar();
        focusBoard();
        selectedUnit = null;
        setDisabled(actionButtons.attack, false);
        console.log("Finished Player_Action");
        if (await isBattleOver()) break;
      }
    } catch (e) {
      if (e == CANCEL) {
        continue;
      }
      throw e;
    }
    playerTurn = false;
    // phaseText.textContent = "Enemy Turn";
    await delay(1500);
    showPhase("Enemy Phase");
    phase = Phase.ENEMY_TURN;
    await runEnemyTurn();
    updateObstacle();

    playerTurn = true;
    console.log("Finished Enemy Turn");
    if (await isBattleOver()) break;
    turnCounter++;
  }

  console.log("Battle is Over!");
}
// Making Buttons Disabled
function setDisabled(btn, disabled) {
  btn.setAttribute("button-disabled", String(disabled));
}

async function isBattleOver() {
  let friendlyUnit = allUnits.filter((e) => e.affiliation == 0);
  let enemyUnit = allUnits.filter((e) => e.affiliation == 1);
  // if (friendlyUnit.length == 0 || enemyUnit.length == 0) {
  //   // phaseText.textContent = "Game Over!";
  //   return true;
  // }

  if (friendlyUnit.length == 0) {
    gameOverCover.textContent = "You Lose";
    await delay(1500);
    gameOverCover.classList.remove("hidden");
    return true;
  }

  if (enemyUnit.length == 0) {
    gameOverCover.textContent = "You Win";
    await delay(1500);
    gameOverCover.classList.remove("hidden");
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

function showPhase(text) {
  gamePhase.textContent = text;

  if (text == "Player Phase") {
    gamePhase.classList.remove("hidden");
    gamePhase.classList.remove("animate");
    void gamePhase.offsetWidth;
    gamePhase.classList.add("animate");
    gamePhase.style.background = "linear-gradient(to right, #07688f, #1e068b)";
  }
  if (text == "Enemy Phase") {
    gamePhase.classList.remove("animate");
    void gamePhase.offsetWidth;
    gamePhase.classList.add("animate");
    gamePhase.style.background =
      "linear-gradient(to right, #ff4a4aff, #680000ff)";
  }
}

async function runEnemyTurn() {
  let enemyUnit = allUnits.filter((e) => e.affiliation == 1);
  for (const u of enemyUnit) {
    enemyMoves = [];
    closestFriendly = null;
    optimalMove = [];
    enemyPossibleMoves(u.row, u.col, u.movement);
    findClosestFriendly(u);
    checkOptimalMove();
    // const path = buildPath(optimalMove[0], optimalMove[1]);

    // console.log(r, c);
    // console.log(parent);
    // console.log(optimalMove);
    // console.log(reachable);
    // console.log(path);

    if (checkAdjacent(u)) {
      enemyAttack(u);
      if (closestFriendly.checkDead()) removeDead();
    } else {
      await enemyMove(u);
      console.log("No adjacent, moving");
      console.log(checkAdjacent(u));
      if (checkAdjacent(u)) {
        console.log("Found a guy");
        enemyAttack(u);
        if (closestFriendly.checkDead()) removeDead();
      }
    }

    console.log(`Ran Enemy Turn ${u.name}`);
    await delay(1000);
  }
}

function enemyAttack(enemyUnit) {
  enemyUnit.attackPlayer(closestFriendly);
  if (!closestFriendly.checkDead()) {
    hurtAnimation(closestFriendly);
  }
  attackAnimation(enemyUnit);
}

async function enemyMove(enemyUnit) {
  if (!closestFriendly) return;
  const [oR, oC] = optimalMove[0];
  const { _, parent } = enemyPossibleMoves(
    enemyUnit.row,
    enemyUnit.col,
    enemyUnit.movement
  );
  // console.log(enemyUnit.node);
  // console.log(optimalMove);

  const path = buildPath(parent, oR, oC);
  // console.log(r, c);
  // console.log(path);

  let t;
  for (const { r, c } of path) {
    // console.log(r, c);
    runAnimation(enemyUnit);
    t = tileAt(r, c);
    // console.log(t);
    t.appendChild(enemyUnit.node);
    enemyUnit.row = r;
    enemyUnit.col = c;
    await delay(500);
  }
  enemyUnit.node.classList.remove("run");
  enemyUnit.node.style.setProperty(
    "--sprite-url",
    `url("assets/${enemyUnit.unitType}/Idle.png")`
  );
  // console.log(enemyUnit);
}

function checkOptimalMove() {
  let closestDistance = 1000;
  let tempDistance;
  if (!closestFriendly) return;
  for (const [r, c] of enemyMoves) {
    if (ifObstacle(r, c)) continue;
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

const key = (r, c) => `${r},${c}`;
function enemyPossibleMoves(startRow, startCol, moveRange) {
  const parent = {};
  const reachable = [];
  const queue = [[startRow, startCol, moveRange]];
  const visited = new Set([`${startRow},${startCol}`]);

  parent[key(startRow, startCol)] = null;

  while (queue.length) {
    const [r, c, movementLeft] = queue.shift();
    reachable.push({ r, c });
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
      const k = key(newRow, newCol);
      if (
        !inBounds(newRow, newCol) ||
        visited.has(k) ||
        ifObstacle(newRow, newCol) ||
        isOccupied(newRow, newCol)
      )
        continue;

      visited.add(k);
      parent[k] = key(r, c);
      queue.push([newRow, newCol, movementLeft - 1]);
    }
  }

  // console.log(parent);
  // console.log(reachable);
  for (const { r, c } of reachable) {
    // let [r, c] = key.map(Number);
    // console.log(obstacles);
    if (ifObstacle(r, c)) continue;
    enemyMoves.push([r, c]);
    // tileAt(r, c).classList.add("highlight");
  }

  // console.log(parent);
  return { reachable, parent };
}

function buildPath(parent, endRow, endCol) {
  const endKey = key(endRow, endCol);
  if (!(endKey in parent)) return [];

  const path = [];
  for (let k = endKey; k != null; k = parent[k]) {
    const [r, c] = k.split(",").map(Number);
    path.push({ r, c });
  }
  return path.reverse();
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
  console.log("playerselected?", playerSelected);
  if (playerSelected) {
    console.log("In Bounds?", highlightBounds(r, c));
    if (!highlightBounds(r, c)) return false;
    console.log("In obstacles?", ifObstacle(r, c));
    console.log(obstacles);
    if (ifObstacle(r, c)) return false;
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
  // console.log(mapObstacles);

  let unitObstacles = allUnits.map((e) => [e.row, e.col]);
  if (playerSelected) {
    unitObstacles = allUnits
      .filter((e) => e.affiliation == 1)
      .map((e) => [e.row, e.col]);
    // unitObstacles = unitObstacles.filter(
    //   ([r, c]) => !(r === selectedUnit.row && c === selectedUnit.col)
    // );
    obstacles = [...unitObstacles, ...mapObstacles];
  } else {
    // unitObstacles = allUnits.map((e) => [e.row, e.col]);
    obstacles = [...unitObstacles, ...mapObstacles];
  }
}

function ifObstacle(r, c) {
  return obstacles.some((e) => e[0] == r && e[1] == c);

  // allUnits.some((e) => e.row == r && e.col == c && e !== selectedUnit);
}

// Player Move
// const playerNode = document.createElement("div");
// playerNode.className = "player";

function inBounds(r, c) {
  return r >= 0 && r < row && c >= 0 && c < col;
}

function placePlayer(r, c) {
  // console.log("placePlayer");
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
    !ifObstacle(r, c)
  )
    placePlayer(r, c);
  // if (inBounds(r, c) && highlightBounds(r, c) ) placePlayer(r, c);
}

// Highlight

// Highlight possible moves
function highlightMove(startRow, startCol, moveRange) {
  updateObstacle();
  console.log(allUnits);
  console.log(obstacles);
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
      if (ifObstacle(newRow, newCol)) continue;

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
    if (ifObstacle(r, c)) continue;
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

  const strengthValue = document.createElement("div");
  strengthValue.classList.add("strength-value");
  strengthValue.classList.add("hidden");
  // strengthValue.textContent = "STR  20";

  const healthBarContainer = document.createElement("div");
  healthBarContainer.classList.add("health-bar-container");

  const healthBarBackground = document.createElement("div");
  healthBarBackground.classList.add("health-bar-background");

  const healthValue = document.createElement("div");
  healthValue.classList.add("health-value");
  healthValue.textContent = "30/40";

  const healthBarFill = document.createElement("div");
  healthBarFill.classList.add("health-bar-fill");
  healthBarFill.style.width = "100%";

  healthBarContainer.appendChild(healthValue);
  healthBarBackground.appendChild(healthBarFill);
  healthBarContainer.appendChild(healthBarBackground);

  el.appendChild(healthBarContainer);
  el.appendChild(strengthValue);
  unit.node = el;

  unit.setHealthBar(healthBarFill);
  unit.setStrength(strengthValue);
  unit.setHealthValue(healthValue);

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
    currentUnitsQueue = currentUnitsQueue.filter(
      (u) => u.playerId !== unit.playerId
    );
    console.log("updated");
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

let startRow;
let startCol;
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
      console.log("Inside Select");
      startRow = hover.row;
      startCol = hover.col;
      playerSelected = true;
      updateObstacle();
      updatePlayable(selectedUnit);
      highlightMove(selectedUnit.row, selectedUnit.col, selectedUnit.movement);
      playSfx(btnClick, 0.5, 0);
      console.log(selectedUnit);
      selectedUnit.strengthValue.classList.remove("hidden");

      return;
    }
  }
  if (e.key == " " && playerSelected == true) {
    if (
      allUnits.some(
        (u) => u.row == hover.row && u.col == hover.col && u !== selectedUnit
      )
    )
      return;
    console.log("Inside deselect");
    removeHighlight();
    clearHighTile();
    // selectedUnit = null;
    playerSelected = false;
    updateObstacle();
    updatePlayable(selectedUnit);
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

function runAnimation(unit) {
  unit.node.classList.remove("run");
  unit.node.style.setProperty(
    "--sprite-url",
    `url("assets/${unit.unitType}/Run.png")`
  );
  unit.node.classList.add("run");
  // playSfx(deadGrunt, 0.2, 200);
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
  // consoleContent += `\n${selectedUnit.name} attacked ${receivingUnit.name} `;
  // consoleTextField.textContent = consoleContent;
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

// let tempRecievingUnit;
let attackOn = false;
function doAction(action) {
  switch (action) {
    case "attack":
      if (actionButtons.attack.getAttribute("button-disabled") === "true")
        return;
      attackOn = true;
      console.log("attack");
      // tempRecievingUnit = receivingUnit;
      // console.log("tempRecievingUnit", tempRecievingUnit);
      // console.log("playerSelected", receivingUnit);

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
      updatePlayable(selectedUnit);
      selectedUnit.playerWait();
      // selectedUnit.strengthValue.classList.add("hidden");

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
      selectedUnit.strengthValue.classList.add("hidden");

      playerSelected = false;
      selectedUnit = null;
      playSfx(btnClick, 0.5, 0);
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
      playSfx(btnClick, 0.5, 0);
      // showHoverAt(selectedUnit.r, selectedUnit.c);
    }
  }
});

// When action bar is pulled up
// actionBar.addEventListener("keydown", (e) => {
//   // console.log(e.key);
//   e.preventDefault();
//   if (e.key == "x") {
//     if ((playerSelected = true && phase == "player_action")) {
//       closeActionBar();
//       focusBoard();
//       console.log(selectedUnit);
//       // highTile = null;
//       highlightMove(startRow, startCol, selectedUnit.movement);
//       console.log(highTile);
//       console.log("Inside X actionbar");
//       // phase = phase.PLAYER_SELECT;
//       playerSelected = true;
//       // actionButtons.attack.disabled = false;

//       gates[Phase.PLAYER_ACTION].cancel();
//     }
//   }
// });

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

container.addEventListener("click", (e) => {
  console.log("click");
  console.log(gameStart);
  e.preventDefault();
  if (gameStart == false) {
    gameStart = true;
    startCover.classList.add("hidden");
    runBattle();
  }
});

let bgmMuted = false;
toggleBGM.addEventListener("click", () => {
  // console.log("toggle");
  bgmMuted = !bgmMuted;
  if (bgmMuted == true) {
    bgm.pause();
  } else {
    bgm.play();
  }
});

resetGame.addEventListener("click", () => {
  console.log("toggle");
  // Refresh the browser
  window.location.reload();
});
