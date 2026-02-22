import { Phase } from "./state.js";

export const dialogue = [
  {
    speaker: "???",
    text: "Hello, I'm mainly focused on doing code logic stuff so the design and stuff is going to suck.",
    url: "talk",
  },
  {
    speaker: "???",
    text: "So yeah...",
    url: "talk",
  },
  {
    speaker: "???",
    text: "Be a little nice okay?",
    url: "smile",
  },
  {
    speaker: "???",
    text: "Gosh, I really sunk so many hours into this.",
    url: "sadness",
  },
  {
    speaker: "???",
    text: "Anyways, enjoy the game I guess.",
    url: "talk",
  },
];

let currentLine = 0;
let dialogueActive = false;

export function initDialogue(ui) {
  console.log(ui.descriptionBox);
  ui.speakerName.classList.remove("hidden");
  ui.description.classList.remove("hidden");
  ui.characterImage.classList.remove("hidden");

  ui.description.focus();

  dialogueActive = true;

  showDialogue(ui, currentLine);
}

export function showDialogue(ui, currentLine) {
  ui.speakerName.textContent = dialogue[currentLine].speaker;
  ui.description.textContent = dialogue[currentLine].text;
  ui.characterImage.src = `assets/queen/${dialogue[currentLine].url}.png`;
  //   ui.descriptionBox.classList.add("hidden");
}

export function activateDialogueControls(ui, gates) {
  //   use document to read the entire thing
  document.addEventListener("keydown", (e) => {
    e.preventDefault();

    if (e.code === "KeyZ" && dialogueActive) {
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
