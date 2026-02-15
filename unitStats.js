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
    magic = 10,
    skill = 10,
    speed = 10,
    luck = 10,
    defense = 0,
    resistance = 10,
    movement = 2,
    affiliation = 0,
    row = 0,
    col = 0,
    inventory = null,
    skills = null,
  }) {
    this.playerId = playerId;
    this.name = name;
    this.unitType = unitType;
    this.variant = variant;
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
    this.inventory = inventory;
    this.skills = skills;

    if (affiliation !== 0 && affiliation !== 1) {
      throw new Error("Affiliation Value Error");
    }
    this.affiliation = affiliation;
  }

  // getters

  get hitRate() {
    return this.skill * 2 + this.luck * 0.5 + 40;
  }

  get avoidRate() {
    return this.speed * 2 + this.luck - 20;
  }

  get critRate() {
    return this.skill / 2 + 30;
  }

  get terrainBonus() {
    return getTileType(this.row, this.col);
  }

  setHealthValue(el) {
    this.healthValue = el;
    this.updateHealthValue();
  }

  updateHealthValue() {
    this.healthValue.textContent = `${this.health}/${this.maxHealth}`;
  }

  setHealthBar(el) {
    this.healthBarFill = el;
    this.updateHealthBar();
  }

  updateHealthBar() {
    const pct = Math.max(
      0,
      Math.min(100, (this.health / this.maxHealth) * 100),
    );
    this.healthBarFill.style.width = `${pct}%`;
  }

  setStrength(el) {
    this.strengthValue = el;
    this.updateStrength();
  }

  updateStrength() {
    this.strengthValue.textContent = `ATK ${this.strength}`;
  }

  attackPlayer(target, type, skillBonus) {
    let damage = damageCalculation(this, target, type, skillBonus);
    target.takeDamage(damage);

    return damage;
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    this.updateHealthBar();
    this.updateHealthValue();
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
