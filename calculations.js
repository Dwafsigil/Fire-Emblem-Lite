// formulas

export function damageCalculation(
  attacker,
  defender,
  special,
  type,
  skillBonus,
) {
  const attack = attacker.strength;
  const defense = defender.defense;
  const intelligence = attacker.intelligence;
  const resistance = defender.resistance;

  if (attacker.unitType === "wizard") {
    if ((special = "Armor Pen")) {
      if (type === "Hit") return Math.floor(intelligence + skillBonus);
      if (type === "Crit") return Math.floor((intelligence + skillBonus) * 1.5);
    } else {
      if (type === "Hit")
        return Math.floor(intelligence + skillBonus - resistance);
      if (type === "Crit")
        return Math.floor((intelligence + skillBonus) * 1.5 - resistance);
    }
  }
  if (attacker.unitType === "knight") {
    if (type === "Hit") return Math.floor(attack + skillBonus - defense);
    if (type === "Crit")
      return Math.floor((attack + skillBonus) * 1.5 - defense);
  }
}
