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

const STORAGE_KEY = 'queens_stats_v3';
const DIFF_KEY = 'queens_difficulty_v1';
const LEVEL_KEY = 'queens_levels_v1';
const COINS_KEY = 'queens_coins_v1';
const OWNED_KEY = 'queens_owned_v1';
const ACTIVE_THEME_KEY = 'queens_theme_v1';
const ACTIVE_QUEEN_KEY = 'queens_queen_v1';

function loadStats(): PersistentStats {
  if (typeof window === 'undefined') return { ...INITIAL_STATS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_STATS };
    const parsed = JSON.parse(raw) as Partial<PersistentStats>;
    return { ...INITIAL_STATS, ...parsed, bestTime: { ...INITIAL_STATS.bestTime, ...(parsed.bestTime ?? {}) }, bestHints: { ...INITIAL_STATS.bestHints, ...(parsed.bestHints ?? {}) } };
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

// Calculate coins earned: random 42-69, minus penalty for errors and hints
function calculateCoinsEarned(errors: number, hintsUsed: number): number {
  const base = Math.floor(Math.random() * 28) + 42; // 42-69
  const errorPenalty = errors * 5; // -5 per error
  const hintPenalty = hintsUsed * 3; // -3 per hint
  return Math.max(10, base - errorPenalty - hintPenalty); // minimum 10
}

function recordGame(stats: PersistentStats, result: QueensStats): PersistentStats {
  const ns: PersistentStats = { ...stats, gamesPlayed: stats.gamesPlayed + 1, gamesWon: stats.gamesWon + (result.won ? 1 : 0), totalTime: stats.totalTime + result.timeSeconds, totalHints: stats.totalHints + result.hintsUsed, totalCoins: stats.totalCoins + result.coinsEarned, lastGame: result, history: [result, ...stats.history].slice(0, 50), bestTime: { ...stats.bestTime }, bestHints: { ...stats.bestHints } };
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
  showStats: boolean; showResult: boolean; showShop: boolean;
  levels: Record<Difficulty, number>;
  coins: number;
  ownedItems: string[];
  activeTheme: string;
  activeQueen: string;
  lastCoinsEarned: number;

  startNewGame: (d?: Difficulty) => void; setDifficulty: (d: Difficulty) => void;
  setCellState: (r: number, c: number, state: 'empty' | 'x' | 'crown') => void;
  cycleCell: (r: number, c: number) => void; undo: () => void; reset: () => void;
  useHint: () => void; endGame: (won: boolean) => void; tick: () => void;
  toggleStats: () => void; toggleShop: () => void; dismissResult: () => void;
  buyItem: (id: string) => void;
  setTheme: (id: string) => void; setQueen: (id: string) => void;
}

function buildNewGame(d: Difficulty) {
  const cfg = DIFFICULTY_CONFIG[d]; const p = generatePuzzle(cfg.size);
  return { difficulty: d, size: cfg.size, cells: p.cells, solution: p.queens, history: [p.cells.map(r => r.map(c => ({ ...c })))], errors: [], errorCount: 0, timeSeconds: 0, isRunning: true, isGameOver: false, hasWon: false, hintsUsed: 0, lastResult: null, showResult: false };
}

export const useQueensStore = create<QueensState>((set, get) => ({
  difficulty: 'normal', size: 8, cells: null, solution: null, history: [], errors: [], errorCount: 0, timeSeconds: 0, isRunning: false, isGameOver: false, hasWon: false, hintsUsed: 0, lastResult: null, stats: loadStats(), showStats: false, showResult: false, showShop: false,
  levels: loadLevels(), coins: loadCoins(), ownedItems: loadOwned(), activeTheme: loadActiveTheme(), activeQueen: loadActiveQueen(), lastCoinsEarned: 0,

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
    // Calculate coins earned (only on win)
    const coinsEarned = won ? calculateCoinsEarned(state.errorCount, state.hintsUsed) : 0;
    const result: QueensStats = { timeSeconds: state.timeSeconds, hintsUsed: state.hintsUsed, won, difficulty: state.difficulty, gridSize: state.size, coinsEarned, date: new Date().toISOString() };
    const ns = recordGame(state.stats, result);
    // Add coins to total
    const newCoins = state.coins + coinsEarned;
    saveCoins(newCoins);
    // Increase level on win
    let newLevels = { ...state.levels };
    if (won) { newLevels[state.difficulty] = (newLevels[state.difficulty] ?? 1) + 1; saveLevels(newLevels); }
    set({ isRunning: false, isGameOver: true, hasWon: won, lastResult: result, stats: ns, showResult: true, levels: newLevels, coins: newCoins, lastCoinsEarned: coinsEarned });
  },
  tick: () => { const state = get(); if (!state.isRunning) return; set({ timeSeconds: state.timeSeconds + 1 }); },
  toggleStats: () => set(s => ({ showStats: !s.showStats })),
  toggleShop: () => set(s => ({ showShop: !s.showShop })),
  dismissResult: () => set({ showResult: false }),
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
