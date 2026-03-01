// keeps track of turn stuff

import { Phase } from "./state.js";
import { initGame } from "./gameInit.js";
import { startMusic } from "./audio.js";
import { setDisabled } from "./actionbarInput.js";
import { checkAdjacent } from "./unitQueries.js";
// import { closeActionBar } from "./uiControls.js";
// import { focusBoard } from "./uiControls.js";
import { runEnemyTurn } from "./enemyAI.js";
import { updateObstacle } from "./movement.js";
import { showCondition } from "./helpers.js";
import { CANCEL } from "./gates.js";
import { tileAt } from "./board.js";
import { initDialogue } from "./dialogue.js";

export const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export async function runBattle(state, ui, gates) {
  initGame(state, ui);
  startMusic(0);
  showCondition(ui);
  // dialogue
  state.phase = Phase.DIALOGUE;
  initDialogue(state, ui);

  await gates[Phase.DIALOGUE].wait();
  // state.phase = Phase.PLAYER_SELECT;
  while (true) {
    try {
      // setDisabled(ui.actionButtons.attack, false);
      initPlayerTurn(state);
      showPhase(ui, "Player Phase");
      const el = document.createElement("li");
      el.textContent = `Turn ${state.turnCounter}:`;
      ui.combatLog.appendChild(el);

      while (hasPlayableUnits(state)) {
        ui.turnText.textContent = `Turn: ${state.turnCounter}`;

        if (await isBattleOver(state, ui)) break;
        state.phase = Phase.PLAYER_SELECT;

        // marker
        console.log("Player Select");

        // ui.actionBarEl.classList.add("hidden");
        // ui.boardEl.focus();
        console.log(state.currentUnitsQueue);

        enableActionButtons(ui);
        await gates[Phase.PLAYER_SELECT].wait();

        // if (!checkAdjacent(state, state.selectedUnit)) {
        //   setDisabled(ui.actionButtons.attack, true);
        // }

        while (state.selectedUnit.hasAction || state.selectedUnit.hasMove) {
          if (await isBattleOver(state, ui)) break;

          ui.itemList.classList.remove("glow");
          ui.skillList.classList.remove("glow");

          // Player Action
          state.phase = Phase.PLAYER_ACTION;
          updateActionButtons(state, ui);

          console.log("Player Action");

          const actionType = await gates[Phase.PLAYER_ACTION].wait();

          try {
            switch (actionType) {
              case "attack":
                state.phase = Phase.PLAYER_ATTACK;

                await gates[Phase.PLAYER_ATTACK].wait();
                state.selectedUnit.hasAction = false;

                break;
              case "move":
                state.phase = Phase.PLAYER_MOVE;
                await gates[Phase.PLAYER_MOVE].wait();

                state.selectedUnit.hasMove = false;

                // console.log(state.selectedUnit.hasMove);

                break;

              case "skill":
                state.phase = Phase.PLAYER_SKILL;

                await gates[Phase.PLAYER_SKILL].wait();
                state.selectedUnit.hasAction = false;

                break;
              case "item":
                state.phase = Phase.PLAYER_ITEM;

                await gates[Phase.PLAYER_ITEM].wait();
                state.selectedUnit.hasAction = false;
                break;
              case "wait":
                // console.log("inside wait");
                state.selectedUnit.hasAction = false;
                state.selectedUnit.hasMove = false;
                break;
            }
          } catch (e) {
            if (e === CANCEL) {
              continue;
            }
            throw e;
          }
        }

        // console.log("outside");
        // ui.actionBarEl.classList.add("hidden");

        // ui.boardEl.focus();

        // if the unit completely has no more actions/move

        // updateObstacle(state);
        console.log("After Unit Action");
        if (!state.selectedUnit.hasMove && !state.selectedUnit.hasAction) {
          removePlayable(
            state.playerTurn,
            state.currentUnitsQueue,
            state.selectedUnit,
          );
          console.log("After Removing Unit");
          ui.actionBarEl.classList.add("hidden");
          ui.boardEl.focus();

          state.selectedUnit.node.classList.add("grayed");

          state.selectedUnit = null;
          state.playerSelected = false;
          // ui.actionBarEl.classList.add("hidden");
        }

        // console.log(state.currentUnitsQueue);

        if (await isBattleOver(state, ui)) break;
        // console.log("outside 2");
      }
    } catch (e) {
      if (e == CANCEL) {
        continue;
      }
      throw e;
    }

    if (await isBattleOver(state, ui)) break;
    state.playerTurn = false;

    await delay(1500);
    showPhase(ui, "Enemy Phase");

    let friendlyUnits = state.units.filter((e) => e.affiliation == 0);

    for (const unit of friendlyUnits) {
      unit.node.classList.remove("grayed");
    }

    state.phase = Phase.ENEMY_TURN;
    // console.log("Run Enemy Turn");
    await runEnemyTurn(state, ui);
    updateObstacle(state);

    state.playerTurn = true;
    if (await isBattleOver(state, ui)) break;
    state.turnCounter++;
  }
}

// ✅
export function initPlayerTurn(state) {
  state.currentUnitsQueue = state.units.filter((u) => u.affiliation == 0);

  state.currentUnitsQueue.forEach((unit) => {
    unit.hasMove = true;
    unit.hasAction = true;
  });
}

// ✅
export function hasPlayableUnits(state) {
  return state.currentUnitsQueue.length > 0;
}

// ✅
export function removePlayable(playerTurn, currentUnitsQueue, selectedUnit) {
  if (!playerTurn || !selectedUnit) return;

  for (let i = currentUnitsQueue.length - 1; i >= 0; i--) {
    if (currentUnitsQueue[i].playerId === selectedUnit.playerId) {
      currentUnitsQueue.splice(i, 1);
      break;
    }
  }
}

// end the game
export async function isBattleOver(state, ui) {
  let friendlyUnit = state.units.filter((e) => e.affiliation == 0);
  let enemyUnit = state.units.filter((e) => e.affiliation == 1);

  const seizedCastle = friendlyUnit.some((unit) => {
    return unit.row === 6 && unit.col === 5;
  });

  // if castle is seized
  if (seizedCastle) {
    ui.gameOverCover.textContent = "Castle Captured";
    await delay(1000);
    ui.gameOverCover.classList.remove("hidden");

    return true;
  }

  // if all friendly unit dies

  if (friendlyUnit.length == 0) {
    ui.gameOverCover.textContent = "Game Over";
    await delay(2000);
    ui.gameOverCover.classList.remove("hidden");

    return true;
  }

  // if all enemy unit dies

  if (enemyUnit.length == 0) {
    ui.gameOverCover.textContent = "Enemy Routed";
    await delay(2000);
    ui.gameOverCover.classList.remove("hidden");

    return true;
  }

  return false;
}

// restart game
export function restartGame() {}

// ✅
export function showPhase(ui, text) {
  ui.gamePhase.textContent = text;

  if (text == "Player Phase") {
    ui.gamePhase.classList.remove("hidden");
    ui.gamePhase.classList.remove("animate");
    void ui.gamePhase.offsetWidth;
    ui.gamePhase.classList.add("animate");
    ui.gamePhase.style.background =
      "linear-gradient(to right, #07688f, #1e068b)";
  }
  if (text == "Enemy Phase") {
    ui.gamePhase.classList.remove("animate");
    void ui.gamePhase.offsetWidth;
    ui.gamePhase.classList.add("animate");
    ui.gamePhase.style.background =
      "linear-gradient(to right, #ff4a4aff, #680000ff)";
  }
}

export function initEnemyTurn() {
  state.currentUnitsQueue = state.units.filter((u) => u.affiliation == 1);
}
// ✅
export function checkPlayable(currentUnitsQueue, unit) {
  return currentUnitsQueue.some((e) => e.playerId == unit.playerId);
}

export function updateActionButtons(state, ui) {
  ui.actionBarEl.querySelectorAll("button").forEach((btn) => {
    const a = btn.dataset.action;

    if (a === "move") {
      setDisabled(btn, !state.selectedUnit.hasMove);
    } else if (a === "wait") {
      setDisabled(btn, "false");
    } else {
      setDisabled(btn, !state.selectedUnit.hasAction);
    }
  });

  // console.log();
}

export function enableActionButtons(ui) {
  ui.actionBarEl.querySelectorAll("button").forEach((btn) => {
    setDisabled(btn, "false");
  });
}
