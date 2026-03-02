// enemy decision making

import { inBounds } from "./board.js";
import { ifObstacle } from "./movement.js";
import { isOccupied } from "./unitQueries.js";
import { checkAdjacent } from "./unitQueries.js";
import { delay } from "./turn.js";
import { runAnimation } from "./animations.js";
import { tileAt } from "./board.js";
import { hurtAnimation } from "./animations.js";
import { attackAnimation } from "./animations.js";
import { attack } from "./combatInput.js";
import { removeDead } from "./unitsView.js";
import { healthBarUI } from "./unitStatsUI.js";
export async function runEnemyTurn(state, ui) {
  // console.log("Running Enemy Turn");
  let enemyUnit = state.units.filter((e) => e.affiliation == 1);
  // console.log(enemyUnit);
  for (const u of enemyUnit) {
    state.enemyMoves.length = 0;
    state.closestFriendly = null;
    state.optimalMove = null;

    enemyPossibleMoves(state, u.row, u.col, u.movement);

    state.closestFriendly = findClosestFriendly(
      state.units,
      u,
      state.closestFriendly,
    );

    // console.log("Closest friendly", state.closestFriendly);

    state.optimalMove = checkOptimalMove(
      state.enemyMoves,
      state.closestFriendly,
      state.optimalMove,
      state.obstacles,
    );

    // console.log(checkAdjacent(state, u));
    if (checkAdjacent(state, u)) {
      enemyAttack(state, ui, u, state.closestFriendly);
      healthBarUI(ui, state.closestFriendly);
      // if (state.closestFriendly.checkDead()) removeDead(state, ui);
    } else {
      await enemyMove(state, ui, u);
      if (checkAdjacent(state, u)) {
        enemyAttack(state, ui, u, state.closestFriendly);
        healthBarUI(ui, state.closestFriendly);

        // if (state.closestFriendly.checkDead()) removeDead(state, ui);
      } else {
        const el = document.createElement("li");
        el.textContent = `${u.name} is waiting`;
        ui.combatLog.appendChild(el);
      }
    }

    await delay(1000);
  }
}

export async function enemyMove(state, ui, enemyUnit) {
  // console.log(state.closestFriendly);
  if (!state.closestFriendly) return;
  const [oR, oC] = state.optimalMove[0];
  const { _, parent } = enemyPossibleMoves(
    state,
    enemyUnit.row,
    enemyUnit.col,
    enemyUnit.movement,
  );

  const path = buildPath(parent, oR, oC);

  let t;
  for (const { r, c } of path) {
    runAnimation(enemyUnit);
    t = tileAt(ui.boardEl, r, c);

    t.appendChild(enemyUnit.node);
    enemyUnit.row = r;
    enemyUnit.col = c;
    await delay(500);
  }
  enemyUnit.node.classList.remove("run");
  // enemyUnit.node.style.setProperty(
  //   "--sprite-url",
  //   `url("assets/${enemyUnit.variant}/Idle.png")`,
  // );
}

const key = (r, c) => `${r},${c}`;

// ✅
// checks possible moves
export function enemyPossibleMoves(state, startRow, startCol, moveRange) {
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
        !inBounds(state.board.rows, state.board.cols, newRow, newCol) ||
        visited.has(k) ||
        ifObstacle(state.obstacles, newRow, newCol) ||
        isOccupied(state.units, newRow, newCol)
      )
        continue;

      visited.add(k);
      parent[k] = key(r, c);
      queue.push([newRow, newCol, movementLeft - 1]);
    }
  }

  for (const { r, c } of reachable) {
    if (ifObstacle(state.obstacles, r, c)) continue;
    state.enemyMoves.push([r, c]);
  }

  // console.log(parent);
  return { reachable, parent };
}

export function enemyAttack(state, ui, enemyUnit, closestFriendly) {
  const type = attack(enemyUnit, closestFriendly, state.useSkill, state, ui);

  if (closestFriendly.checkDead()) {
    removeDead(state, ui, closestFriendly);
  }
  if ((!closestFriendly.checkDead() && type === "Hit") || type === "Crit") {
    hurtAnimation(closestFriendly);
  }

  // enemyUnit.attackPlayer(closestFriendly);
  // if (!closestFriendly.checkDead()) {
  //   hurtAnimation(closestFriendly);
  // }
  // attackAnimation(enemyUnit);
}

export function checkOptimalMove(
  enemyMoves,
  closestFriendly,
  optimalMove,
  obstacles,
) {
  // console.log("Running check optimal");
  // console.log(closestFriendly);

  let closestDistance = 1000;
  let tempDistance;
  if (!closestFriendly) return optimalMove;

  for (const [r, c] of enemyMoves) {
    if (ifObstacle(obstacles, r, c)) continue;

    tempDistance = Math.sqrt(
      Math.pow(closestFriendly.row - r, 2) +
        Math.pow(closestFriendly.col - c, 2),
    );

    if (tempDistance < closestDistance) {
      closestDistance = tempDistance;
      optimalMove = [[r, c]];
    }
  }

  // console.log("optimal move", optimalMove);

  return optimalMove;
}
// ✅
// finds the closest friendly unit
export function findClosestFriendly(units, enemyUnit, closestFriendly) {
  let friendlyUnit = units.filter((e) => e.affiliation == 0);
  let closestDistance = 1000;
  let tempDistance;

  for (const u of friendlyUnit) {
    tempDistance = Math.sqrt(
      Math.pow(u.row - enemyUnit.row, 2) + Math.pow(u.col - enemyUnit.col, 2),
    );

    if (tempDistance < closestDistance) {
      closestDistance = tempDistance;
      closestFriendly = u;
    }
  }
  // console.log("find closest friendly", closestFriendly);
  return closestFriendly;
}

export function buildPath(parent, endRow, endCol) {
  const endKey = key(endRow, endCol);
  if (!(endKey in parent)) return [];

  const path = [];
  for (let k = endKey; k != null; k = parent[k]) {
    const [r, c] = k.split(",").map(Number);
    path.push({ r, c });
  }
  return path.reverse();
}
