// import the stuff later

import { unitAt } from "./unitQueries.js";
export function showUnitStats(units, r, c) {
  // if tile contains unit
  // reveal unit stat ui and show stats
  // else if no unit
  // keep unit stat closed

  const hoveredUnit = unitAt(units, r, c);
  console.log(hoveredUnit.name);
}
