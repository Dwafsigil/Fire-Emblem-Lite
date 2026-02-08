// ui references and dom

export function createUI() {
  const boardEl = document.querySelector(".board");
  const actionBarEl = document.querySelector(".action-bar");

  return {
    boardEl,
    actionBarEl,

    phaseText: document.querySelector(".phase"),
    turnText: document.querySelector(".turn"),
    gameOverCover: document.querySelector(".game-over-cover"),
    consoleTextField: document.querySelector(".text-container"),
    consoleLog: document.querySelector(".console-log"),
    gamePhase: document.querySelector(".current-phase"),
    btns: Array.from(document.querySelectorAll(".action-btn")),
    container: document.querySelector(".container"),
    startCover: document.querySelector(".start-cover"),
    actionButtons: {
      attack: actionBarEl.querySelector(`[data-action="attack"]`),
      ability: actionBarEl.querySelector(`[data-action="ability"]`),
      item: actionBarEl.querySelector(`[data-action="item"]`),
      wait: actionBarEl.querySelector(`[data-action="wait"]`),
    },
    resetGame: document.querySelector(".reset-game"),
    toggleBGM: document.querySelector(".toggle-bgm"),
    startCover: document.querySelector(".start-cover"),
    startBtn: document.querySelector(".start-Btn"),
    controlsBtn: document.querySelector(".controls-Btn"),
    creditsBtn: document.querySelector(".credits-Btn"),
    controls: document.querySelector(".controls"),
    credits: document.querySelector(".credits"),
    unitName: document.querySelector(".unit-name"),
    unitHealthStat: document.querySelector(".unit-health-stat"),
    unitAttackStat: document.querySelector(".unit-attack-stat"),
    unitDefenseStat: document.querySelector(".unit-defense-stat"),
    unitMovementStat: document.querySelector(".unit-movement-stat"),
    statList: document.querySelector(".stat-list"),
  };
}
