// formulas

export function damageCalculation(attacker, defender, type, skillBonus) {
  const attack = attacker.strength;
  const defense = defender.defense;

  if (type === "Hit") return Math.floor(attack + skillBonus - defense);
  if (type === "Crit") return Math.floor((attack + skillBonus) * 1.5 - defense);
}
