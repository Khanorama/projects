// XP needed to finish level n: 30, 42, 59, 82, 115, 161, ...
export function xpForLevel(level) {
  return Math.round(30 * Math.pow(1.4, level - 1));
}

export function xpToLevel(totalXp) {
  let level = 1;
  let spent = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (spent + needed > totalXp) break;
    spent += needed;
    level++;
  }
  return level;
}

export function xpInCurrentLevel(totalXp) {
  let level = 1;
  let spent = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (spent + needed > totalXp) return totalXp - spent;
    spent += needed;
    level++;
  }
}

export function xpForCurrentLevel(totalXp) {
  return xpForLevel(xpToLevel(totalXp));
}
