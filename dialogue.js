import { Phase } from "./state.js";

export const dialogue = [
  {
    speaker: "???",
    text: "Hello, I'm messing around with the dialogue stuff so all of the text will be filler.",
    url: "talk",
  },
  {
    speaker: "???",
    text: "Yeah so...",
    url: "talk",
  },
  {
    speaker: "???",
    text: "Sssiiiiiiiiiixxxx SSSeeeeveeeennnn haha.",
    url: "smile",
  },
  {
    speaker: "???",
    text: "Man, I need a girlfriend so bad.",
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

    if (e.key === "z" && dialogueActive) {
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
