// formulas

export function damageCalculation(attacker, defender, type) {
  const attack = attacker.strength;
  const defense = defender.defense;

  if (type === "Hit") return Math.floor(attack - defense);
  if (type === "Crit") return Math.floor(attack * 1.5 - defense);
}
