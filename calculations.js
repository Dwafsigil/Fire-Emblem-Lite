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

  if (attacker.unitType === "Wizard") {
    if (special === "Armor Pen") {
      if (type === "Hit")
        return Math.max(Math.floor(intelligence + skillBonus), 0);
      if (type === "Crit")
        return Math.max(Math.floor((intelligence + skillBonus) * 1.5), 0);
    } else {
      if (type === "Hit")
        return Math.max(Math.floor(intelligence + skillBonus - resistance), 0);
      if (type === "Crit")
        return Math.max(
          Math.floor((intelligence + skillBonus) * 1.5 - resistance),
          0,
        );
    }
  }
  if (attacker.unitType === "Knight") {
    if (type === "Hit")
      return Math.max(Math.floor(attack + skillBonus - defense), 0);
    if (type === "Crit")
      return Math.max(Math.floor((attack + skillBonus) * 1.5 - defense), 0);
  }
}
