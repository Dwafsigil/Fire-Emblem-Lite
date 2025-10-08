export function damageCalculation(attacker, defender) {
  const attack = attacker.strength;
  const defense = defender.defense;

  return attack - defense;
}
