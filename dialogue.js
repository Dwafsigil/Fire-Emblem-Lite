import { btnClick } from "./audio.js";
import { Phase } from "./state.js";
import { playSfx } from "./audio.js";
import { textBlip } from "./audio.js";
import { delay } from "./turn.js";
// import { gates } from "./script.js";
// import { Phase } from "./state.js";

export const dialogue = [
  {
    speaker: "???",
    text: "Hello! Thanks a ton for checking out the game.",
    url: "talk",
  },
  {
    speaker: "???",
    text: "The game is inspired from Fire Emblem. I decided to do this little project to learn more Javascript.",
    url: "talk",
  },
  // {
  //   speaker: "???",
  //   text: "If you have any feedback to improve the game, let me know!",
  //   url: "talk",
  // },
  {
    speaker: "???",
    text: "The objective is to either wipe out the enemies or seize the castle.",
    url: "talk",
  },
  {
    speaker: "???",
    text: "Enjoy!",
    url: "smile",
  },
  //   {
  //     speaker: "???",
  //     text: "Gosh, I really sunk so many hours into this.",
  //     url: "sadness",
  //   },
  //   {
  //     speaker: "???",
  //     text: "Anyways, enjoy the game I guess.",
  //     url: "talk",
  //   },
];

export const dialogueWon = [
  {
    speaker: "???",
    text: "Well done! You've won!",
    url: "talk",
  },
  {
    speaker: "???",
    text: "Hope you enjoyed the demo. Don't forget to leave some feedback!",
    url: "smile",
  },
];

export const dialogueLoss = [
  {
    speaker: "???",
    text: "Aw, better luck next time!",
    url: "talk",
  },
  {
    speaker: "???",
    text: "Hope you enjoyed the demo. Don't forget to leave some feedback!",
    url: "smile",
  },
];

let isTyping = false;
let skipTyping = false;
let dialogueActive = false;
let currentLine;

// let currentLine = 0;

export function initDialogue(state, ui) {
  currentLine = 0;
  ui.speakerName.classList.remove("hidden");
  ui.description.classList.remove("hidden");
  ui.characterImage.classList.remove("hidden");

  bgm.volume = 0.02;

  // special one off function that makes the animation run on next frame
  requestAnimationFrame(() => {
    ui.characterImage.classList.add("animation");
  });
  // ui.characterImage.classList.add("animation");
  ui.description.focus();

  dialogueActive = true;

  showDialogue(state, ui, currentLine);
}

export async function showDialogue(state, ui, currentLine) {
  let line;
  let currentDialogue;

  if (state.phase === Phase.GAME_OVER) {
    if (state.playerWon === true) {
      line = dialogueWon[currentLine];
      currentDialogue = dialogueWon;
    } else if (state.playerWon === false) {
      line = dialogueLoss[currentLine];
      currentDialogue = dialogueLoss;
    }
  } else {
    line = dialogue[currentLine];
    currentDialogue = dialogue;
  }

  ui.speakerName.textContent = currentDialogue[currentLine].speaker;
  // ui.description.textContent = dialogue[currentLine].text;
  ui.characterImage.src = `assets/queen/${currentDialogue[currentLine].url}.png`;
  //   ui.descriptionBox.classList.add("hidden");

  // type writer effect
  ui.description.textContent = "";
  isTyping = true;
  skipTyping = false;

  const text = line.text;

  let textCounter = 0;

  for (let i = 0; i < text.length; i++) {
    if (skipTyping) break;

    ui.description.textContent += text[i];

    // Adding a bit of a pause on punctuation
    let char = text[i];
    let extra = 0;
    if (char === "." || char === "!" || char === "?") {
      extra = 100;
    } else if (char === ",") {
      extra = 50;
    } else {
      0;
    }

    // ignore space for the counter
    if (char !== " ") {
      textCounter++;
      if (textCounter % 3 === 0) {
        playSfx(textBlip, 0.5, 0);
      }
    }

    await delay(18 + extra);
  }

  // important as z command gets stuck without it
  isTyping = false;

  // if skip text then just reveal text
  ui.description.textContent = text;
}

export function activateDialogueControls(state, ui, gates) {
  //   use document to read the entire thing
  document.addEventListener("keydown", (e) => {
    e.preventDefault();

    if (e.code === "KeyZ" && dialogueActive) {
      playSfx(btnClick, 0.5, 0);

      if (isTyping) {
        skipTyping = true;
        return;
      }

      currentLine++;

      let dialogueLength;

      if (state.phase === Phase.DIALOGUE) dialogueLength = dialogue.length;
      if (state.phase === Phase.GAME_OVER && state.playerWon === true)
        dialogueLength = dialogueWon.length;
      if (state.phase === Phase.GAME_OVER && state.playerWon === false)
        dialogueLength = dialogueWon.length;

      if (currentLine === dialogueLength) {
        ui.speakerName.classList.add("hidden");
        ui.description.classList.add("hidden");
        ui.characterImage.classList.remove("animation");
        // ui.characterImage.classList.add("fade-out");

        // ui.characterImage.classList.add("hidden");

        // setTimeout(() => {
        //   //  ui.characterImage.src = `assets/queen/talk.png`;
        //   ui.characterImage.classList.add("hidden");
        //   ui.characterImage.src = `assets/queen/talk.png`;
        // }, 100);

        ui.characterImage.classList.add("hidden");
        ui.characterImage.src = `assets/queen/talk.png`;

        // ui.characterImage.src = "";

        // ui.descriptionBox.classList.add("hidden");

        //   Open phase to move on
        dialogueActive = false;

        // ui.characterImage.src = `assets/queen/talk.png`;
        bgm.volume = 0.06;

        gates[Phase.DIALOGUE].open();
      } else {
        showDialogue(state, ui, currentLine);
      }
    }
  });
}
