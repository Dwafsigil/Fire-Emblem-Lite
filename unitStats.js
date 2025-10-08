import { damageCalculation } from "./calculations";

export class unitStats {
  constructor(
    name,
    health,
    strength,
    magic,
    skill,
    speed,
    luck,
    defense,
    resistance,
    movement
  ) {
    this.name = name;
    this.health = health;
    this.strength = strength;
    this.magic = magic;
    this.skill = skill;
    this.speed = speed;
    this.luck = luck;
    this.defense = defense;
    this.resistance = resistance;
    this.movement = movement;
  }

  //   getStrength() {
  //     return this.strength;
  //   }

  //   getDefense() {
  //     return this.defense;
  //   }

  attackPlayer(target) {
    let damage = damageCalculation(this, target);
    target.takeDamage(damage);
    console.log(`${this.name} attacked ${target.name} for ${damage} damage!`);
  }

  takeDamage(damage) {
    this.health -= damage;
    console.log(`${this.name} is now ${this.health} HP! `);
  }
}
