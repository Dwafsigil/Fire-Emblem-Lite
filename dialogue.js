import { btnClick } from "./audio.js";
import { Phase } from "./state.js";
import { playSfx } from "./audio.js";
import { textBlip } from "./audio.js";
import { delay } from "./turn.js";
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
  {
    speaker: "???",
    text: "If you have any feedback to improve the game, let me know!",
    url: "talk",
  },
  {
    speaker: "???",
    text: "The objective for this game is to either rout the enemies or sieze the castle.",
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

let isTyping = false;
let skipTyping = false;
let currentLine = 0;
let dialogueActive = false;

export function initDialogue(ui) {
  ui.speakerName.classList.remove("hidden");
  ui.description.classList.remove("hidden");
  ui.characterImage.classList.remove("hidden");

  ui.description.focus();

  dialogueActive = true;

  showDialogue(ui, currentLine);
}

export async function showDialogue(ui, currentLine) {
  const line = dialogue[currentLine];

  ui.speakerName.textContent = dialogue[currentLine].speaker;
  // ui.description.textContent = dialogue[currentLine].text;
  ui.characterImage.src = `assets/queen/${dialogue[currentLine].url}.png`;
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

export function activateDialogueControls(ui, gates) {
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

      if (currentLine === dialogue.length) {
        ui.speakerName.classList.add("hidden");
        ui.description.classList.add("hidden");
        ui.characterImage.classList.add("hidden");
        // ui.descriptionBox.classList.add("hidden");

        //   Open phase to move on
        gates[Phase.DIALOGUE].open();
        dialogueActive = false;
      } else {
        showDialogue(ui, currentLine);
      }
    }
  });
}
