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

  switch (terrain) {
    case "rock":
      ui.terrainStat.textContent = "Hill";
      break;
    case "forest":
      ui.terrainStat.textContent = "Forest";
      break;
    case "castle":
      ui.terrainStat.textContent = "Castle";
      break;
    case "grass":
      ui.terrainStat.textContent = "Grass";
      break;
  }
}
