export function escapeMenuControls(ui, state, gates) {
  document.addEventListener("keydown", (e) => {
    e.preventDefault;
    console.log("Pressed");
    if (e.code === "Escape") {
      if (ui.escapeMenu.classList.contains("hidden")) {
        ui.escapeMenu.classList.remove("hidden");
      } else {
        ui.escapeMenu.classList.add("hidden");
      }
    }
  });
}

// Element.classList.contains()
