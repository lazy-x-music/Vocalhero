import type { LevelInfo } from '@/types';

export const LEVELS: readonly LevelInfo[] = [
  { level: 1, name: 'Garage Rookie', minXp: 0, maxXp: 100 },
  { level: 2, name: 'Club Singer', minXp: 100, maxXp: 300 },
  { level: 3, name: 'Stage Warrior', minXp: 300, maxXp: 600 },
  { level: 4, name: 'Touring Vocalist', minXp: 600, maxXp: 1000 },
  { level: 5, name: 'Arena Hero', minXp: 1000, maxXp: 1600 },
  { level: 6, name: 'Vocal Legend', minXp: 1600, maxXp: null },
] as const;

export function getLevelInfo(level: number): LevelInfo {
  const idx = Math.min(Math.max(level, 1), LEVELS.length) - 1;
  return LEVELS[idx];
}

export function getLevelForXp(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXpProgress(xp: number): {
  current: number;
  needed: number;
  percent: number;
  level: LevelInfo;
  nextLevel: LevelInfo | null;
} {
  const level = getLevelForXp(xp);
  const nextLevel = level.maxXp ? getLevelInfo(level.level + 1) : null;
  const current = xp - level.minXp;
  const needed = level.maxXp ? level.maxXp - level.minXp : 0;
  const percent = needed > 0 ? Math.min((current / needed) * 100, 100) : 100;
  return { current, needed, percent, level, nextLevel };
}
