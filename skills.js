export const skills = {
  empoweredStrike: {
    id: "empoweredStrike",
    name: "Empowered Strike",
    type: "knight",
    uses: 3,
    bonus: 5,
    special: "None",
    description: "Empower attack increasing base damage by 5.",
  },
  fireball: {
    id: "fireball",
    name: "Fireball",
    type: "wizard",
    uses: 2,
    bonus: 10,
    special: "Armor Pen",
    description: "1.5x magic scaling, ignores armor",
  },
};

export function useSkill() {}
