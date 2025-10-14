import { damageCalculation } from "./calculations.js";
// import { consoleContent, consoleLog, consoleTextField } from "./script.js";

export class unitStats {
  constructor({
    playerId,
    name,
    unitType,
    maxHealth = 10,
    health = 10,
    healthBarFill = null,
    strength = 10,
    magic = 10,
    skill = 10,
    speed = 10,
    luck = 10,
    defense = 10,
    resistance = 10,
    movement = 2,
    affiliation = 0,
    row = 0,
    col = 0,
  }) {
    this.playerId = playerId;
    this.name = name;
    this.unitType = unitType;
    this.health = health;
    this.maxHealth = maxHealth;
    this.healthBarFill = healthBarFill;
    this.strength = strength;
    this.magic = magic;
    this.skill = skill;
    this.speed = speed;
    this.luck = luck;
    this.defense = defense;
    this.resistance = resistance;
    this.movement = movement;
    this.row = row;
    this.col = col;

    if (affiliation !== 0 && affiliation !== 1) {
      throw new Error("Affiliation Value Error");
    }
    this.affiliation = affiliation;
  }

  setHealthBar(el) {
    this.healthBarFill = el;
    this.updateHealthBar();
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
    // consoleContent = `\n${this.name} attacked ${target.name} for ${damage} damage!`;
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    this.updateHealthBar();
    console.log(`${this.name} is now ${this.health} HP! `);
  }

  playerWait() {
    console.log("I'm chillin rn gang");
  }

  checkDead() {
    if (this.health <= 0) {
      console.log(`${this.name} has fallen`);
      return true;
    }
    return false;
  }

  updateHealthBar() {
    const pct = Math.max(
      0,
      Math.min(100, (this.health / this.maxHealth) * 100)
    );
    this.healthBarFill.style.width = `${pct}%`;
  }
}
