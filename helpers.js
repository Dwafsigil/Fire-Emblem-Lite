export function playAndRemove(el) {
  el.addEventListener("animationend", () => el.remove(), { once: true });
}
