// ui buttons

let btns = [];
let actionBar = null;
let board = null;
let i = 0;

export function initUIControls(ui) {
  btns = ui.btns;
  actionBar = ui.actionBarEl;
  board = ui.boardEl;

  i = btns.findIndex((b) => b.tabIndex === 0);
  if (i < 0) {
    i = 0;
    btns[0].tabIndex = 0;
  }
}

// ✅
export function setDisabled(btn, disabled) {
  btn.setAttribute("button-disabled", String(disabled));
}

export function setActive(index = 0) {
  const enabled = btns.filter((b) => !b.disabled);
  enabled.forEach((b, j) => (b.tabIndex = j == index ? 0 : -1));
  btns[index].focus();
}

export function nextIndex(from, dir) {
  let n = from;
  let l = btns.length;
  do {
    n = (n + dir + l) % l;
  } while (btns[n].disabled && n !== from);
  return n;
}

// ✅
export function openActionBar(actionBarEl) {
  actionBarEl.classList.remove("hidden");
  setActive(i);
}

export function closeActionBar(actionBarEl) {
  actionBarEl.classList.add("hidden");
}

export function focusBoard(boardEl) {
  board.focus();
}
