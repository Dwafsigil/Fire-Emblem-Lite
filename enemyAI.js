// enemy decision making

import { inBounds } from "./board.js";
import { ifObstacle } from "./movement.js";
import { checkUnitAdjacent, isOccupied } from "./unitQueries.js";
import { delay } from "./turn.js";
import { runAnimation } from "./animations.js";
import { tileAt } from "./board.js";
import { hurtAnimation } from "./animations.js";
import { attack } from "./combatInput.js";
import { removeDead } from "./unitsView.js";
import { healthBarUI } from "./unitStatsUI.js";
import { counterAttack } from "./combatInput.js";

export async function runEnemyTurn(state, ui) {
  let enemyUnit = state.units.filter((e) => e.affiliation == 1);
  let friendlyUnit = state.units.filter((e) => e.affiliation == 0);

  for (const u of enemyUnit) {
    state.enemyMoves.length = 0;
    state.closestFriendly = null;
    state.optimalMove = null;

    // Check all potential enemy moves
    enemyPossibleMoves(state, u.row, u.col, u.movement);

    state.closestFriendly = chooseTarget(state, friendlyUnit, u);

    state.optimalMove = checkOptimalMove(
      state.enemyMoves,
      state.closestFriendly,
      state.optimalMove,
      state.obstacles,
      enemyUnit,
    );

    if (checkUnitAdjacent(u, state.closestFriendly)) {
      await enemyAttack(state, ui, u, state.closestFriendly);
      await delay(900);
      await counterAttack(state, ui, u);
      await delay(200);

      healthBarUI(ui, state.closestFriendly);
      // if (state.closestFriendly.checkDead()) removeDead(state, ui);
    } else {
      // fix here
      await enemyMove(state, ui, u);
      if (checkUnitAdjacent(u, state.closestFriendly)) {
        await enemyAttack(state, ui, u, state.closestFriendly);
        await delay(900);
        await counterAttack(state, ui, u);
        await delay(200);

        // attack(state.closestFriendly, u, state.useSkill, state, ui);

        healthBarUI(ui, state.closestFriendly);

        // if (state.closestFriendly.checkDead()) removeDead(state, ui);
      } else {
        const el = document.createElement("li");
        el.textContent = `${u.name} is waiting`;
        ui.combatLog.appendChild(el);
        ui.combatLog.scrollTop = ui.combatLog.scrollHeight;
      }
    }

    await delay(1000);
  }
}

function chooseTarget(state, friendlyUnit, enemy) {
  let bestScore = 0;
  let bestTarget = null;
  let attackableUnits = getAttackableUnits(
    state,
    enemy,
    state.enemyMoves,
    friendlyUnit,
  );

  let targetUnits = attackableUnits || friendlyUnit;

  for (let unit of targetUnits) {
    let armorResis = enemy.strength ? unit.defense : unit.resistance;
    // console.log(damageType);
    let score = 0;
    let damage = unit.strength || unit.intelligence;
    let unitDistance = Math.sqrt(
      Math.pow(unit.row - 7, 2) + Math.pow(unit.col - 5, 2),
    );

    // Distance to Castle Gate
    if (unitDistance <= 3) {
      score += (60 - unitDistance) * 6;
    } else {
      score += (40 - unitDistance) * 5;
    }
    // Unit Health
    score += (10 - unit.health) * 2;
    // Unit Damage
    score += damage * 2;

    score += -(armorResis * 0.75);

    if (score >= bestScore) {
      bestScore = score;
      bestTarget = unit;
    }
  }
  return bestTarget;
}

export async function enemyMove(state, ui, enemyUnit) {
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
}

const key = (r, c) => `${r},${c}`;

// ✅
// checks possible moves
export function enemyPossibleMoves(state, startRow, startCol, moveRange) {
  const parent = {};
  const reachable = [];
  const queue = [[startRow, startCol, moveRange]];
  const visited = new Set([`${startRow},${startCol}`]);
  let friendlyUnits = state.units.filter((e) => e.affiliation == 0);

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
      // if (
      //   !inBounds(state.board.rows, state.board.cols, newRow, newCol) ||
      //   visited.has(k) ||
      //   ifObstacle(state.obstacles, newRow, newCol) ||
      //   isOccupied(state.units, newRow, newCol)
      // )
      //   continue;

      if (
        !inBounds(state.board.rows, state.board.cols, newRow, newCol) ||
        visited.has(k) ||
        ifObstacle(state.mapObstacles, newRow, newCol) ||
        isOccupied(friendlyUnits, newRow, newCol)
      ) {
        continue;
      }

      visited.add(k);
      parent[k] = key(r, c);
      queue.push([newRow, newCol, movementLeft - 1]);
    }
  }

  for (const { r, c } of reachable) {
    // if (ifObstacle(state.obstacles, r, c)) continue;
    state.enemyMoves.push([r, c]);
  }

  return { reachable, parent };
}

function getAttackableUnits(state, enemy, moveTiles, friendlyUnits) {
  const attackable = [];

  const legalTiles = moveTiles.filter(([r, c]) => {
    return (
      (r === enemy.row && c === enemy.col) || !isOccupied(state.units, r, c)
    );
  });

  for (const [r, c] of legalTiles) {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dR, dC] of directions) {
      const attackRow = r + dR;
      const attackCol = c + dC;

      const unit = friendlyUnits.find(
        (u) => u.row === attackRow && u.col === attackCol,
      );

      if (unit && !attackable.includes(unit)) {
        attackable.push(unit);
      }
    }
  }

  return attackable;
}

export async function enemyAttack(state, ui, enemyUnit, closestFriendly) {
  const type = attack(enemyUnit, closestFriendly, state.useSkill, state, ui);

  if (closestFriendly.checkDead()) {
    removeDead(state, ui, closestFriendly);
  }
  if ((!closestFriendly.checkDead() && type === "Hit") || type === "Crit") {
    hurtAnimation(closestFriendly);
  }
}

export function checkOptimalMove(
  enemyMoves,
  closestFriendly,
  optimalMove,
  obstacles,
  enemyUnits,
) {
  let closestDistance = 1000;
  let tempDistance;
  if (!closestFriendly) return optimalMove;

  for (const [r, c] of enemyMoves) {
    if (ifObstacle(obstacles, r, c) || isOccupied(enemyUnits, r, c)) continue;

    tempDistance = Math.sqrt(
      Math.pow(closestFriendly.row - r, 2) +
        Math.pow(closestFriendly.col - c, 2),
    );

    if (tempDistance < closestDistance) {
      closestDistance = tempDistance;
      optimalMove = [[r, c]];
    }
  }

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
