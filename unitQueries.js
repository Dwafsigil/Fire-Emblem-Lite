// unit lookups

export function checkUnitAdjacent(attacker, defender) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dR, dC] of directions) {
    const newRow = attacker.row + dR;
    const newCol = attacker.col + dC;

    if (defender.row === newRow && defender.col === newCol) return true;
  }
  return false;
}

// export function unitAdjacent(units, defender, r, c) {
//   return units.find(
//     (u) =>
//       u.row === defenderr && u.col === c && u.affiliation === 1,
//   );
// }

// export function enemyAt(playerTurn, units, r, c) {
//   if (playerTurn == true) {
//     return units.find((u) => u.row === r && u.col === c && u.affiliation === 1);
//   }
//   if (playerTurn == false) {
//     return units.find((u) => u.row === r && u.col === c && u.affiliation === 0);
//   }
// }

// ✅
export function checkAdjacent(state, unit = null) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  if (state.playerTurn == true) {
    for (const [dR, dC] of directions) {
      const newRow = state.selectedUnit.row + dR;
      const newCol = state.selectedUnit.col + dC;
      if (enemyNear(state.playerTurn, state.units, newRow, newCol)) {
        return true;
      }
      // return false;
    }
  } else {
    for (const [dR, dC] of directions) {
      const newRow = unit.row + dR;
      const newCol = unit.col + dC;
      if (enemyNear(state.playerTurn, state.units, newRow, newCol)) {
        return true;
      }
      // return false;
    }
  }
  return false;
}

// ✅
export function unitAt(units, r, c) {
  return units.find((u) => u.row === r && u.col === c);
}

// ✅
export function isOccupied(units, r, c) {
  if (unitAt(units, r, c) == null) return;
  return true;
}

// ✅
export function enemyAt(playerTurn, units, r, c) {
  if (playerTurn == true) {
    return units.find((u) => u.row === r && u.col === c && u.affiliation === 1);
  }
  if (playerTurn == false) {
    return units.find((u) => u.row === r && u.col === c && u.affiliation === 0);
  }
}

// ✅
export function enemyNear(playerTurn, units, r, c) {
  if (enemyAt(playerTurn, units, r, c) == null) return false;
  return true;
}
