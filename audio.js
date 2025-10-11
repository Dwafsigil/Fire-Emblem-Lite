const bgm = document.querySelector("#bgm");
export const btnClick = new Audio("sounds/button_click.wav");
export const hoverSound = new Audio("sounds/hover_tile.mp3");
bgm.volume = 0.06;
bgm.loop = true;

export function startMusic(delay = 0) {
  setTimeout(() => {
    bgm.play().catch(() => {});
  }, delay);
}

// once: true, run once and never again
// window.addEventListener("pointerdown", () => startMusic(0), { once: true });

// play sfx
export function playSfx(name, volume = 0.8, delay = 0) {
  setTimeout(() => {
    // multiple sounds can overlap
    const a = name.cloneNode(true);
    a.volume = volume;
    a.play().catch(() => {});
  }, delay);
}
