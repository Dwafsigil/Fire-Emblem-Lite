export const terrain = {
  forest: { avo: 30 },
};

export function showTerrainInfo(state, ui) {
  let terrain = "grass";

  for (const type in state.obstacleTypes) {
    if (
      state.obstacleTypes[type].some(
        ([r, c]) => r === state.hover.row && c === state.hover.col,
      )
    ) {
      terrain = type;
      break;
    }
  }

  console.log(terrain);

  switch (terrain) {
    case "rock":
      ui.terrainStat.textContent = "Hill";
      break;
    case "forest":
      ui.terrainStat.textContent = "Forest: +30 AVO";
      break;
    case "castle":
      ui.terrainStat.textContent = "Castle";
      break;
    case "grass":
      ui.terrainStat.textContent = "Grass";
      break;
    case "castleGate":
      ui.terrainStat.textContent = "Castle Gate";
      break;
  }
}

export function terrainBonus(state, r, c) {
  const terrainType = state.board.grid[r][c].terrain;

  switch (terrainType) {
    case "grass":
      return 0;
    case "castleGate":
      return 0;
    case "forest":
      return 30;
  }
}

export function getAvoidWithTerrain(state, unit) {
  const unitAvoid = unit.avoidRate;

  const bonus = terrainBonus(state, unit.row, unit.col);

  return Number(unitAvoid + bonus);
}
