// Queens puzzle state store — with level counter + coins + shop.

import { create } from 'zustand';
import {
  Cell,
  QueensStats,
  PersistentStats,
  INITIAL_STATS,
  Difficulty,
  DIFFICULTY_CONFIG,
  MAX_HINTS,
  MAX_ERRORS,
} from './types';
import { generatePuzzle, validateBoard, isSolved } from './generator';
import shopData from './shop-items.json';

// Flatten shop items for lookup (themes + queens)
const ALL_SHOP_ITEMS: { id: string; price: number }[] = [
  ...shopData.themes.map(t => ({ id: t.id, price: t.price })),
  ...shopData.queens.map(q => ({ id: q.id, price: q.price })),
];

const STORAGE_KEY = 'queens_stats_v4';
const DIFF_KEY = 'queens_difficulty_v1';
const LEVEL_KEY = 'queens_levels_v1';
const COINS_KEY = 'queens_pfandflaschen_v1';
const OWNED_KEY = 'queens_owned_v1';
const ACTIVE_THEME_KEY = 'queens_theme_v1';
const ACTIVE_QUEEN_KEY = 'queens_queen_v1';

// Old keys for migration
const OLD_STORAGE_KEY = 'queens_stats_v3';
const OLD_STORAGE_KEY_2 = 'queens_stats_v2';
const OLD_COINS_KEY = 'queens_coins_v1';

// Migration: read old keys, convert field names, save to new key
function migrateData(): void {
  if (typeof window === 'undefined') return;
  try {
    // Check if current v4 data is "empty" (no games played)
    const currentRaw = window.localStorage.getItem(STORAGE_KEY);
    const current = currentRaw ? JSON.parse(currentRaw) : null;
    const currentIsEmpty = !current || (current.gamesPlayed === 0 && (!current.history || current.history.length === 0));

    // Only migrate if current data is empty AND old data exists
    if (!currentIsEmpty) return;

    // Try to find old data in v3 or v2
    for (const oldKey of [OLD_STORAGE_KEY, OLD_STORAGE_KEY_2]) {
      const oldRaw = window.localStorage.getItem(oldKey);
      if (oldRaw) {
        const old = JSON.parse(oldRaw);
        // Skip if old data is also empty
        if (!old || (old.gamesPlayed === 0 && (!old.history || old.history.length === 0))) continue;

        // Convert old field names to new ones
        if (old.totalCoins !== undefined && old.totalPfandflaschen === undefined) {
          old.totalPfandflaschen = old.totalCoins;
          delete old.totalCoins;
        }
        // Convert history entries
        if (old.history && Array.isArray(old.history)) {
          old.history = old.history.map((h: any) => {
            if (h.coinsEarned !== undefined && h.pfandflaschenEarned === undefined) {
              h.pfandflaschenEarned = h.coinsEarned;
              delete h.coinsEarned;
            }
            return h;
          });
        }
        // Convert lastGame
        if (old.lastGame && old.lastGame.coinsEarned !== undefined && old.lastGame.pfandflaschenEarned === undefined) {
          old.lastGame.pfandflaschenEarned = old.lastGame.coinsEarned;
          delete old.lastGame.coinsEarned;
        }
        // Save to new key (overwrite empty v4)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
        // Remove old key
        window.localStorage.removeItem(oldKey);
        break;
      }
    }

    // Migrate coins key: always try (even if v4 had some data)
    const oldCoins = window.localStorage.getItem(OLD_COINS_KEY);
    const currentCoins = window.localStorage.getItem(COINS_KEY);
    if (oldCoins && (!currentCoins || currentCoins === '0')) {
      window.localStorage.setItem(COINS_KEY, oldCoins);
      window.localStorage.removeItem(OLD_COINS_KEY);
    }
  } catch { /* ignore migration errors */ }
}

function loadStats(): PersistentStats {
  if (typeof window === 'undefined') return { ...INITIAL_STATS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as any;
      return {
        ...INITIAL_STATS,
        ...parsed,
        totalPfandflaschen: parsed.totalPfandflaschen ?? parsed.totalCoins ?? 0,
        bestTime: { ...INITIAL_STATS.bestTime, ...(parsed.bestTime ?? {}) },
        bestHints: { ...INITIAL_STATS.bestHints, ...(parsed.bestHints ?? {}) },
      };
    }
    // v4 empty — try old keys as fallback
    for (const oldKey of [OLD_STORAGE_KEY, OLD_STORAGE_KEY_2]) {
      const oldRaw = window.localStorage.getItem(oldKey);
      if (oldRaw) {
        const old = JSON.parse(oldRaw) as any;
        return {
          ...INITIAL_STATS,
          ...old,
          totalPfandflaschen: old.totalPfandflaschen ?? old.totalCoins ?? 0,
          bestTime: { ...INITIAL_STATS.bestTime, ...(old.bestTime ?? {}) },
          bestHints: { ...INITIAL_STATS.bestHints, ...(old.bestHints ?? {}) },
        };
      }
    }
    return { ...INITIAL_STATS };
  } catch { return { ...INITIAL_STATS }; }
}
function saveStats(stats: PersistentStats): void { if (typeof window !== 'undefined') try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch { } }
function loadDifficulty(): Difficulty { if (typeof window === 'undefined') return 'normal'; try { return (window.localStorage.getItem(DIFF_KEY) as Difficulty) ?? 'normal'; } catch { return 'normal'; } }
function saveDifficulty(d: Difficulty): void { if (typeof window !== 'undefined') try { window.localStorage.setItem(DIFF_KEY, d); } catch { } }

function loadLevels(): Record<Difficulty, number> {
  if (typeof window === 'undefined') return { easy: 1, normal: 1, extreme: 1 };
  try {
    const raw = window.localStorage.getItem(LEVEL_KEY);
    if (!raw) return { easy: 1, normal: 1, extreme: 1 };
    const parsed = JSON.parse(raw) as Partial<Record<Difficulty, number>>;
    return { easy: parsed.easy ?? 1, normal: parsed.normal ?? 1, extreme: parsed.extreme ?? 1 };
  } catch { return { easy: 1, normal: 1, extreme: 1 }; }
}
function saveLevels(levels: Record<Difficulty, number>): void {
  if (typeof window !== 'undefined') try { window.localStorage.setItem(LEVEL_KEY, JSON.stringify(levels)); } catch { }
}

// Coins
function loadCoins(): number {
  if (typeof window === 'undefined') return 0;
  try { return parseInt(window.localStorage.getItem(COINS_KEY) ?? '0', 10) || 0; } catch { return 0; }
}
function saveCoins(coins: number): void {
  if (typeof window !== 'undefined') try { window.localStorage.setItem(COINS_KEY, String(coins)); } catch { }
}

// Owned items
function loadOwned(): string[] {
  if (typeof window === 'undefined') return ['theme-pastel', 'queen-classic'];
  try {
    const raw = window.localStorage.getItem(OWNED_KEY);
    if (!raw) return ['theme-pastel', 'queen-classic'];
    return JSON.parse(raw) as string[];
  } catch { return ['theme-pastel', 'queen-classic']; }
}
function saveOwned(owned: string[]): void {
  if (typeof window !== 'undefined') try { window.localStorage.setItem(OWNED_KEY, JSON.stringify(owned)); } catch { }
}

// Active theme + queen skin
function loadActiveTheme(): string {
  if (typeof window === 'undefined') return 'theme-pastel';
  try { return window.localStorage.getItem(ACTIVE_THEME_KEY) ?? 'theme-pastel'; } catch { return 'theme-pastel'; }
}
function saveActiveTheme(id: string): void {
  if (typeof window !== 'undefined') try { window.localStorage.setItem(ACTIVE_THEME_KEY, id); } catch { }
}
function loadActiveQueen(): string {
  if (typeof window === 'undefined') return 'queen-classic';
  try { return window.localStorage.getItem(ACTIVE_QUEEN_KEY) ?? 'queen-classic'; } catch { return 'queen-classic'; }
}
function saveActiveQueen(id: string): void {
  if (typeof window !== 'undefined') try { window.localStorage.setItem(ACTIVE_QUEEN_KEY, id); } catch { }
}

// ── Coins System ──
// Feste Base-Preise pro Difficulty (Zufall innerhalb des Bereichs):
//   easy: 42-50, normal: 67-76, extreme: 88-101
// Deductions: -15% pro Fehler, -20% pro Tipp (vom Base-Preis)
// Timer Bonus (nur wenn 0 Hints verwendet): 
//   easy < 60s: +42, normal < 120s: +67, extreme < 240s: +187
// Bestzeit Bonus (nur wenn 0 Hints verwendet und neue Bestzeit):
//   easy: +25, normal: +50, extreme: +100
function calculatePfandflaschenEarned(
  difficulty: Difficulty,
  errors: number,
  hintsUsed: number,
  timeSeconds: number,
  isNewBestTime: boolean
): { total: number; breakdown: { base: number; errorDeduction: number; hintDeduction: number; timerBonus: number; bestTimeBonus: number } } {
  // Base ranges
  const baseRanges: Record<Difficulty, [number, number]> = {
    easy: [42, 50],
    normal: [67, 76],
    extreme: [88, 101],
  };
  const [minBase, maxBase] = baseRanges[difficulty];
  const base = Math.floor(Math.random() * (maxBase - minBase + 1)) + minBase;

  // Deductions (percentage of base)
  const errorDeduction = Math.round(base * 0.15 * errors);
  const hintDeduction = Math.round(base * 0.20 * hintsUsed);

  // Timer bonus (only if 0 hints used)
  let timerBonus = 0;
  if (hintsUsed === 0) {
    const timerThresholds: Record<Difficulty, number> = { easy: 60, normal: 120, extreme: 240 };
    const timerBonuses: Record<Difficulty, number> = { easy: 42, normal: 67, extreme: 187 };
    if (timeSeconds <= timerThresholds[difficulty]) {
      timerBonus = timerBonuses[difficulty];
    }
  }

  // Best time bonus (only if 0 hints used AND new best time)
  let bestTimeBonus = 0;
  if (hintsUsed === 0 && isNewBestTime) {
    const bestTimeBonuses: Record<Difficulty, number> = { easy: 25, normal: 50, extreme: 100 };
    bestTimeBonus = bestTimeBonuses[difficulty];
  }

  const total = Math.max(0, base - errorDeduction - hintDeduction + timerBonus + bestTimeBonus);
  return { total, breakdown: { base, errorDeduction, hintDeduction, timerBonus, bestTimeBonus } };
}

function recordGame(stats: PersistentStats, result: QueensStats): PersistentStats {
  const ns: PersistentStats = { ...stats, gamesPlayed: stats.gamesPlayed + 1, gamesWon: stats.gamesWon + (result.won ? 1 : 0), totalTime: stats.totalTime + result.timeSeconds, totalHints: stats.totalHints + result.hintsUsed, totalPfandflaschen: stats.totalPfandflaschen + result.pfandflaschenEarned, lastGame: result, history: [result, ...stats.history].slice(0, 50), bestTime: { ...stats.bestTime }, bestHints: { ...stats.bestHints } };
  if (result.won) {
    const p = stats.bestTime[result.difficulty];
    if (p === null || result.timeSeconds < p) ns.bestTime[result.difficulty] = result.timeSeconds;
    const ph = stats.bestHints[result.difficulty];
    if (ph === null || result.hintsUsed < ph) ns.bestHints[result.difficulty] = result.hintsUsed;
  }
  saveStats(ns); return ns;
}

function computeHintCells(cells: Cell[][], size: number, solution: { row: number; col: number }[] | null): { r: number; c: number }[] {
  if (!solution) return [];
  const crownRegions = new Set<number>();
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (cells[r][c].state === 'crown') crownRegions.add(cells[r][c].regionId);
  const regionCells = new Map<number, { r: number; c: number }[]>();
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    const cell = cells[r][c]; if (cell.state === 'crown' || cell.state === 'x') continue;
    if (!regionCells.has(cell.regionId)) regionCells.set(cell.regionId, []);
    regionCells.get(cell.regionId)!.push({ r, c });
  }
  const openRegions = Array.from(regionCells.entries()).filter(([rid]) => !crownRegions.has(rid));
  if (openRegions.length === 0) return [];
  openRegions.sort((a, b) => a[1].length - b[1].length);
  const [smallestRegionId, cellsList] = openRegions[0];
  const sq = solution.find(q => cells[q.row][q.col].regionId === smallestRegionId);
  return cellsList.filter(c => !sq || !(c.r === sq.row && c.c === sq.col)).map(c => ({ r: c.r, c: c.c }));
}

interface QueensState {
  difficulty: Difficulty; size: number; cells: Cell[][] | null; solution: { row: number; col: number }[] | null;
  history: Cell[][][]; errors: { row: number; col: number }[]; errorCount: number;
  timeSeconds: number; isRunning: boolean; isGameOver: boolean; hasWon: boolean;
  hintsUsed: number; lastResult: QueensStats | null; stats: PersistentStats;
  showStats: boolean; showResult: boolean; showShop: boolean; showGamble: boolean;
  levels: Record<Difficulty, number>;
  coins: number;
  ownedItems: string[];
  activeTheme: string;
  activeQueen: string;
  lastPfandflaschenEarned: number;
  pfandflaschenBreakdown: { base: number; errorDeduction: number; hintDeduction: number; timerBonus: number; bestTimeBonus: number } | null;
  gambleBet: number;
  gambleMultiplier: number;
  gambled: boolean;

  startNewGame: (d?: Difficulty) => void; setDifficulty: (d: Difficulty) => void;
  setCellState: (r: number, c: number, state: 'empty' | 'x' | 'crown') => void;
  cycleCell: (r: number, c: number) => void; undo: () => void; reset: () => void;
  useHint: () => void; endGame: (won: boolean) => void; tick: () => void;
  toggleStats: () => void; toggleShop: () => void; dismissResult: () => void;
  buyItem: (id: string) => void;
  setTheme: (id: string) => void; setQueen: (id: string) => void;
  startGamble: () => void; applyGamble: (multiplier: number) => void; skipGamble: () => void;
}

function buildNewGame(d: Difficulty) {
  const cfg = DIFFICULTY_CONFIG[d]; const p = generatePuzzle(cfg.size);
  return { difficulty: d, size: cfg.size, cells: p.cells, solution: p.queens, history: [p.cells.map(r => r.map(c => ({ ...c })))], errors: [], errorCount: 0, timeSeconds: 0, isRunning: true, isGameOver: false, hasWon: false, hintsUsed: 0, lastResult: null, showResult: false };
}

// Run migration on module load (client-side only)
if (typeof window !== 'undefined') {
  migrateData();
}

export const useQueensStore = create<QueensState>((set, get) => ({
  difficulty: 'normal', size: 8, cells: null, solution: null, history: [], errors: [], errorCount: 0, timeSeconds: 0, isRunning: false, isGameOver: false, hasWon: false, hintsUsed: 0, lastResult: null, stats: loadStats(), showStats: false, showResult: false, showShop: false, showGamble: false,
  levels: loadLevels(), coins: loadCoins(), ownedItems: loadOwned(), activeTheme: loadActiveTheme(), activeQueen: loadActiveQueen(), lastPfandflaschenEarned: 0,
  pfandflaschenBreakdown: null, gambleBet: 0, gambleMultiplier: 0, gambled: false,

  startNewGame: (d) => { const diff = d ?? get().difficulty; saveDifficulty(diff); set(buildNewGame(diff)); },
  setDifficulty: (d) => { saveDifficulty(d); set({ difficulty: d }); get().startNewGame(d); },
  setCellState: (r, c, newState) => {
    const state = get(); if (!state.cells || state.isGameOver) return;
    const ng = state.cells.map(row => row.map(cell => ({ ...cell })));
    const cell = ng[r][c]; if (cell.state === newState) return;
    const prevState = cell.state; cell.state = newState; cell.hintExclude = false;
    const errs = validateBoard(ng, state.size); const errSet = new Set(errs.map(e => `${e.row},${e.col}`));
    for (let i = 0; i < state.size; i++) for (let j = 0; j < state.size; j++) ng[i][j].hasError = errSet.has(`${i},${j}`);
    let nec = state.errorCount; if (newState === 'crown' && prevState !== 'crown' && errSet.has(`${r},${c}`)) nec = state.errorCount + 1;
    const nh = [...state.history, ng.map(row => row.map(c2 => ({ ...c2 })))];
    set({ cells: ng, history: nh, errors: errs, errorCount: nec });
    if (nec >= MAX_ERRORS) { setTimeout(() => get().endGame(false), 200); return; }
    if (isSolved(ng, state.size)) setTimeout(() => get().endGame(true), 200);
  },
  cycleCell: (r, c) => {
    const state = get(); if (!state.cells || state.isGameOver) return;
    const cell = state.cells[r][c];
    if (cell.hintExclude) {
      const ng = state.cells.map(row => row.map(c2 => ({ ...c2 }))); ng[r][c].hintExclude = false;
      const nh = [...state.history, ng.map(row => row.map(c2 => ({ ...c2 })))];
      set({ cells: ng, history: nh }); return;
    }
    const next = cell.state === 'empty' ? 'x' : cell.state === 'x' ? 'crown' : 'empty';
    get().setCellState(r, c, next);
  },
  undo: () => {
    const state = get(); if (!state.cells || state.history.length <= 1) return;
    const nh = state.history.slice(0, -1); const prev = nh[nh.length - 1];
    const pc = prev.map(row => row.map(c => ({ ...c })));
    const errs = validateBoard(pc, state.size); const errSet = new Set(errs.map(e => `${e.row},${e.col}`));
    for (let i = 0; i < state.size; i++) for (let j = 0; j < state.size; j++) pc[i][j].hasError = errSet.has(`${i},${j}`);
    let cnt = 0; for (let i = 0; i < state.size; i++) for (let j = 0; j < state.size; j++) if (pc[i][j].state === 'crown' && pc[i][j].hasError) cnt++;
    set({ cells: pc, history: nh, errors: errs, errorCount: cnt });
  },
  reset: () => {
    const state = get(); if (!state.cells) return;
    const cfg = DIFFICULTY_CONFIG[state.difficulty];
    const puzzle = generatePuzzle(cfg.size);
    set({ cells: puzzle.cells, solution: puzzle.queens, history: [puzzle.cells.map(row => row.map(c => ({ ...c })))], errors: [], errorCount: 0, timeSeconds: 0, isRunning: true, isGameOver: false, hasWon: false, hintsUsed: 0, showResult: false });
  },
  useHint: () => {
    const state = get(); if (!state.cells || state.isGameOver || state.hintsUsed >= MAX_HINTS) return;
    const targets = computeHintCells(state.cells, state.size, state.solution);
    if (targets.length === 0) return;
    const ng = state.cells.map(row => row.map(cell => ({ ...cell })));
    for (const t of targets) ng[t.r][t.c].hintExclude = true;
    set({ cells: ng, hintsUsed: state.hintsUsed + 1 });
  },
  endGame: (won) => {
    const state = get(); if (state.isGameOver) return;
    // Check if new best time
    const prevBest = state.stats.bestTime[state.difficulty];
    const isNewBest = won && (prevBest === null || state.timeSeconds < prevBest);
    // Calculate coins with new system
    const coinResult = won
      ? calculatePfandflaschenEarned(state.difficulty, state.errorCount, state.hintsUsed, state.timeSeconds, isNewBest)
      : { total: 0, breakdown: { base: 0, errorDeduction: 0, hintDeduction: 0, timerBonus: 0, bestTimeBonus: 0 } };
    const pfandflaschenEarned = coinResult.total;
    const result: QueensStats = { timeSeconds: state.timeSeconds, hintsUsed: state.hintsUsed, won, difficulty: state.difficulty, gridSize: state.size, pfandflaschenEarned, date: new Date().toISOString() };
    const ns = recordGame(state.stats, result);
    const newCoins = state.coins + pfandflaschenEarned;
    saveCoins(newCoins);
    let newLevels = { ...state.levels };
    if (won) { newLevels[state.difficulty] = (newLevels[state.difficulty] ?? 1) + 1; saveLevels(newLevels); }
    set({
      isRunning: false, isGameOver: true, hasWon: won,
      lastResult: result, stats: ns, showResult: true,
      levels: newLevels, coins: newCoins,
      lastPfandflaschenEarned: pfandflaschenEarned, pfandflaschenBreakdown: won ? coinResult.breakdown : null,
      gambleBet: pfandflaschenEarned, gambleMultiplier: 0, gambled: false, showGamble: false,
    });
  },
  tick: () => { const state = get(); if (!state.isRunning) return; set({ timeSeconds: state.timeSeconds + 1 }); },
  toggleStats: () => set(s => ({ showStats: !s.showStats })),
  toggleShop: () => set(s => ({ showShop: !s.showShop })),
  dismissResult: () => set({ showResult: false }),
  startGamble: () => set({ showGamble: true, showResult: false }),
  applyGamble: (multiplier) => {
    const state = get();
    if (state.gambled) return;
    // multiplier: 0 = lost everything, 1 = bet back, 2 = 2x, 3 = 3x, 5 = 5x
    const winnings = state.gambleBet * multiplier;
    // Remove the original bet (it was already added to coins in endGame)
    // and add the winnings instead
    const adjustedCoins = state.coins - state.gambleBet + winnings;
    saveCoins(adjustedCoins);
    set({ gambleMultiplier: multiplier, gambled: true, coins: adjustedCoins, showGamble: false, showResult: true });
  },
  skipGamble: () => {
    // Keep the original coins, no gamble
    set({ showGamble: false, showResult: true, gambled: true });
  },
  buyItem: (id) => {
    const state = get();
    const item = ALL_SHOP_ITEMS.find(i => i.id === id);
    if (!item) return;
    if (state.ownedItems.includes(id)) return;
    if (state.coins < item.price) return;
    const newCoins = state.coins - item.price;
    const newOwned = [...state.ownedItems, id];
    saveCoins(newCoins); saveOwned(newOwned);
    set({ coins: newCoins, ownedItems: newOwned });
  },
  setTheme: (id) => { saveActiveTheme(id); set({ activeTheme: id }); },
  setQueen: (id) => { saveActiveQueen(id); set({ activeQueen: id }); },
}));
