# Fire Emblem Lite
A browser-based tactical RPG inspired by Fire Emblem, featuring grid-based movement, sprite animations, and turn-based combat - all built from JavaScript, HTML, and CSS.

# Features
- Grid-based movement with BFS pathfinding.
- Turn-based combat with player and enemy phases.
- Enemy AI targets the closest player unit (BFS and Manhattan distance)
- Selectable units highlight move range.
- Sprite animations (attack, move, idle, hurt, death)
- Single map with terrain

# Demo

## Snapshot
<img width="709" height="531" alt="cropped-fire_emblem_lite (1)" src="https://github.com/user-attachments/assets/b3f36f7c-a28c-4b51-9d6d-e7a4f344a57d" />

## Game Link
https://fire-emblem-lite.netlify.app/

# How to Play
1. Use the arrow keys to traverse the board and the space bar to select a unit. "Z" will allow the player to revert their input.
2. With a unit selected, move the unit to a highlighted tile.
3. Choose a unit action (attack or wait)
4. If an enemy unit is adjacent, the friendly unit will attack the enemy unit via the attack action.
5. Once all friendly units act, the player phase will end, beginning the enemy phase.

# Future Plans
- More unit variety with animations (Wizard and Archer).
- More terrain types, and allow some to be traversable with special effects.
- More combat-defining stats such as accuracy, evasion, etc.
- The use of items and abilities.
- Weapon effectiveness triangle.
- Battle log
- Unique special units that have their own stats and abilities.
- Multiple objectives, such as capturing a point or defeating enemies within a certain number of turns.
- Bigger map
- Enemy reinforcements
- Fix clunky movement animations
- Along with a ton more improvements!

# Credits
- Inspired by *Fire Emblem* (Nintendo/Intelligent Systems)
- Background Music: Decisive Battle - Azali

# Personal Note
Hello! I'm Johnny Tu. I created this little game out of my love for Fire Emblem. It's a game that I've played throughout my childhood, and even until now, I'm patiently waiting for their next release in the entry! At the same time, I thought this project would also be a great way to improve my skills and really show what I've learned these past months in JavaScript, HTML, and CSS. Currently, I'm on a break from working on this project as I'm honing in on learning React, but I will absolutely be back in the future to add more features and polish up the game (especially the single 1000+ line JavaScript file). Thanks a thousand times for checking this project out!
