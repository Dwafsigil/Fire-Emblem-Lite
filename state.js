// mutable memory for the game

import { unitStats } from "./unitStats.js";

//
export const Phase = {
  MENU: "menu",
  PLAYER_SELECT: "player_select",
  PLAYER_ACTION: "player_action",
  ENEMY_TURN: "enemy_turn",
};

export function createInitialUnits() {
  return [
    new unitStats({
      playerId: 0,
      name: "Johnny",
      unitType: "Knight_1",
      affiliation: 0,
      row: 2,
      col: 2,
      strength: 10,
      movement: 5,
      inventory: [{ id: "potion" }, { id: "potion" }],
      health: 5,
    }),
    // new unitStats({
    //   playerId: 1,
    //   name: "Abram",
    //   unitType: "Knight_1",
    //   affiliation: 0,
    //   row: 2,
    //   col: 3,
    //   strength: 4,
    // }),
    new unitStats({
      playerId: 1,
      name: "Tyler",
      unitType: "Knight_2",
      affiliation: 1,
      row: 3,
      col: 4,
      movement: 5,
      strength: 5,
      inventory: [{ id: "potion" }],
      health: 30,
      maxHealth: 30,
    }),
    // new unitStats({
    //   playerId: 3,
    //   name: "Emi",
    //   unitType: "Knight_2",
    //   affiliation: 1,
    //   row: 10,
    //   col: 8,
    //   movement: 2,
    //   strength: 4,
    // }),
    // new unitStats({
    //   playerId: 4,
    //   name: "David",
    //   unitType: "Knight_2",
    //   affiliation: 1,
    //   row: 8,
    //   col: 7,
    //   movement: 1,
    //   strength: 10,
    // }),
    // new unitStats({
    //   playerId: 5,
    //   name: "Esmy",
    //   unitType: "Knight_1",
    //   affiliation: 0,
    //   row: 4,
    //   col: 1,
    //   movement: 4,
    //   strength: 4,
    // }),
  ];
}

export function createInitialState() {
  return {
    currentMenu: "startCover",
    enemyMoves: [],
    closestFriendly: null,
    optimalMove: null,

    i: 0,
    units: createInitialUnits(),

    gameStart: false,
    phase: Phase.MENU,
    turnCounter: 1,
    playerTurn: true,

    board: { rows: 12, cols: 12 },
    hover: { row: 0, col: 0 },

    selectedUnit: null,
    playerSelected: false,

    isTargeting: false,
    unitHighlighted: false,
    receivingUnit: null,
    attackOn: false,
    startRow: 0,
    startCol: 0,

    currentUnitsQueue: [],

    mapObstacles: [
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
    ],

    obstacleTypes: {
      rock: [
        [1, 0],
        [2, 0],
        [1, 9],
        [2, 9],
        [1, 10],
        [2, 10],
      ],
      castle: [
        [4, 4],
        [5, 4],
        [6, 4],
        [4, 5],
        [5, 5],
        [6, 5],
        [4, 6],
        [5, 6],
        [6, 6],
      ],
      forest: [
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
      ],
    },

    obstacles: [],

    highTile: [],
  };
}
