// LocalStorage helpers for persistent stats.

import { DIFFICULTY_CONFIG, Difficulty, GameStats, INITIAL_STATS, PersistentStats } from './types';

const STORAGE_KEY = 'strands_stats_v1';
const LAST_THEME_KEY = 'strands_last_theme_v1';

function safeLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadStats(): PersistentStats {
  const ls = safeLocalStorage();
  if (!ls) return { ...INITIAL_STATS };
  try {
    const raw = ls.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_STATS };
    const parsed = JSON.parse(raw) as Partial<PersistentStats>;
    return {
      ...INITIAL_STATS,
      ...parsed,
      bestTime: { ...INITIAL_STATS.bestTime, ...(parsed.bestTime ?? {}) },
      bestErrors: { ...INITIAL_STATS.bestErrors, ...(parsed.bestErrors ?? {}) },
    };
  } catch {
    return { ...INITIAL_STATS };
  }
}

export function saveStats(stats: PersistentStats): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore quota errors
  }
}

export function recordGameResult(stats: PersistentStats, result: GameStats): PersistentStats {
  const newStats: PersistentStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (result.won ? 1 : 0),
    totalTime: stats.totalTime + result.timeSeconds,
    totalErrors: stats.totalErrors + result.errors,
    totalHintsUsed: stats.totalHintsUsed + result.hintsUsed,
    lastGame: result,
    history: [result, ...stats.history].slice(0, 50),
    bestTime: { ...stats.bestTime },
    bestErrors: { ...stats.bestErrors },
  };

  if (result.won) {
    const prev = stats.bestTime[result.difficulty];
    if (prev === null || result.timeSeconds < prev) {
      newStats.bestTime[result.difficulty] = result.timeSeconds;
    }
    const prevErr = stats.bestErrors[result.difficulty];
    if (prevErr === null || result.errors < prevErr) {
      newStats.bestErrors[result.difficulty] = result.errors;
    }
  }
  saveStats(newStats);
  return newStats;
}

export function getLastTheme(): string | null {
  const ls = safeLocalStorage();
  if (!ls) return null;
  try {
    return ls.getItem(LAST_THEME_KEY);
  } catch {
    return null;
  }
}

export function setLastTheme(theme: string): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(LAST_THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Best time across ALL difficulties (returns null if no games won yet)
export function getOverallBestTime(stats: PersistentStats): number | null {
  const times = [
    stats.bestTime.easy,
    stats.bestTime.medium,
    stats.bestTime.hard,
  ].filter((t): t is number => t !== null);
  return times.length > 0 ? Math.min(...times) : null;
}

// Best difficulty (the one with the best time)
export function getBestDifficulty(stats: PersistentStats): Difficulty | null {
  const entries: [Difficulty, number | null][] = [
    ['easy', stats.bestTime.easy],
    ['medium', stats.bestTime.medium],
    ['hard', stats.bestTime.hard],
  ];
  const valid = entries.filter(([, t]) => t !== null) as [Difficulty, number][];
  if (valid.length === 0) return null;
  valid.sort((a, b) => a[1] - b[1]);
  return valid[0][0];
}

export function difficultyLabel(d: Difficulty): string {
  return DIFFICULTY_CONFIG[d].label;
}
