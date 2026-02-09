export function playAndRemove(el) {
  console.log("Ran playAndRemove", el);

  el.addEventListener("animationend", () => el.remove(), { once: true });
}
