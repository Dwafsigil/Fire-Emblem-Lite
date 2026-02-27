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

        // battle log

        if (await isBattleOver(state, ui)) break;
        state.phase = Phase.PLAYER_SELECT;

        await gates[Phase.PLAYER_SELECT].wait();

        // if (!checkAdjacent(state, state.selectedUnit)) {
        //   setDisabled(ui.actionButtons.attack, true);
        // }

        while (true) {
          // Player Action
          state.phase = Phase.PLAYER_ACTION;

          updatePlayable(
            state.playerTurn,
            state.currentUnitsQueue,
            state.selectedUnit,
          );

          const actionType = await gates[Phase.PLAYER_ACTION].wait();

          if (actionType === "wait") break;

          try {
            switch (actionType) {
              case "attack":
                state.phase = Phase.PLAYER_ATTACK;
                // console.log(state.phase);

                await gates[Phase.PLAYER_ATTACK].wait();

                //  await delay( state.selectedUnit.node.classList.add("grayed");
                break;

              case "skill":
                state.phase = Phase.PLAYER_SKILL;
                // console.log(state.phase);

                await gates[Phase.PLAYER_SKILL].wait();
                break;
              case "item":
                state.phase = Phase.PLAYER_ITEM;

                await gates[Phase.PLAYER_ITEM].wait();
                break;
            }

            break;
          } catch (e) {
            if (e === CANCEL) {
              continue;
            }
            throw e;
          }
        }

        // state.selectedUnit.node.classList.add("grayed");
        // ui.actionBarEl.classlist.add("hidden");
        ui.actionBarEl.classList.add("hidden");

        // closeActionBar(ui.actionBarEl);
        // focusBoard(ui.boardEl);
        ui.boardEl.focus();
        state.selectedUnit = null;
        // setDisabled(ui.actionButtons.attack, false);
        if (await isBattleOver(state, ui)) break;
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
}

// ✅
export function hasPlayableUnits(state) {
  return state.currentUnitsQueue.length > 0;
}

// ✅
export function updatePlayable(playerTurn, currentUnitsQueue, selectedUnit) {
  if (!playerTurn || !selectedUnit) return;

  for (let i = currentUnitsQueue.length - 1; i >= 0; i--) {
    if (currentUnitsQueue[i].playerId === selectedUnit.playerId) {
      currentUnitsQueue.splice(i, 1);
      break;
    }
  }
  // if (playerTurn) {
  //   currentUnitsQueue = currentUnitsQueue.filter(
  //     (u) => u.playerId !== selectedUnit.playerId,
  //   );
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
