// unit class

import { damageCalculation } from "./calculations.js";

export class unitStats {
  constructor({
    playerId,
    name,
    unitType = "Knight",
    variant = "knight",
    maxHealth = 10,
    health = 10,
    healthBarFill = null,
    strength = 10,
    intelligence = 10,
    skill = 10,
    speed = 10,
    luck = 10,
    defense = 0,
    resistance = 10,
    movement = 2,
    affiliation = 0,
    row = 0,
    col = 0,
    inventory = [],
    equipped = null,
    skills = [],
    range = 1,
    hasMove = true,
    hasAction = true,
  }) {
    this.playerId = playerId;
    this.name = name;
    this.unitType = unitType;
    this.variant = variant;
    this.health = health;
    this.maxHealth = maxHealth;
    this.healthBarFill = healthBarFill;
    this.strength = strength;
    this.intelligence = intelligence;
    this.skill = skill;
    this.speed = speed;
    this.luck = luck;
    this.defense = defense;
    this.resistance = resistance;
    this.movement = movement;
    this.row = row;
    this.col = col;
    this.inventory = inventory;
    this.equipped = equipped;
    this.skills = skills;
    this.range = range;
    this.hasMove = hasMove;
    this.hasAction = hasAction;

    if (affiliation !== 0 && affiliation !== 1) {
      throw new Error("Affiliation Value Error");
    }
    this.affiliation = affiliation;
  }

  // getters

  get hitRate() {
    // fix
    return this.skill * 2 + this.luck * 0.5 + 50;
  }

  get avoidRate() {
    return this.speed * 2 + this.luck - 20;
  }

  get critRate() {
    return this.skill / 2 + 10;
  }

  get terrainBonus() {
    return getTileType(this.row, this.col);
  }

  setHealthValue(el) {
    this.healthValue = el;
    this.updateHealthValue();
  }

  // updateHealthValue() {
  //   this.healthValue.textContent = `${this.health}/${this.maxHealth}`;
  // }

  setHealthBar(el) {
    this.healthBarFill = el;
    this.updateHealthBar();
  }

  updateHealthBar() {
    const pct = Math.max(
      0,
      Math.min(100, (this.health / this.maxHealth) * 100),
    );

    let color;

    if (pct < 33) {
      color = "red";
      // console.log("red");
    } else if (pct < 66) {
      color = "yellow";
      // console.log("yellow");
    } else {
      color = "#4ade80";
      // console.log("green");
    }

    this.healthBarFill.style.backgroundColor = `${color}`;

    this.healthBarFill.style.width = `${pct}%`;
  }

  setStrength(el) {
    this.strengthValue = el;
    this.updateStrength();
  }

  updateStrength() {
    this.strengthValue.textContent = `ATK ${this.strength}`;
  }

  attackPlayer(target, special, type, skillBonus) {
    let damage = damageCalculation(this, target, special, type, skillBonus);
    target.takeDamage(damage);

    return damage;
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    this.updateHealthBar();

    // this.updateHealthValue();
  }

  playerWait() {
    // this.strengthValue.classList.add("hidden");
  }

  checkDead() {
    if (this.health <= 0) {
      return true;
    }
    return false;
  }
}
