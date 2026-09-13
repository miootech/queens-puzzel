// Queens puzzle state store — with difficulty + smart hint (exclusion cross-out).

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

const STORAGE_KEY = 'queens_stats_v2';
const DIFF_KEY = 'queens_difficulty_v1';

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

function recordGame(stats: PersistentStats, result: QueensStats): PersistentStats {
  const ns: PersistentStats = { ...stats, gamesPlayed: stats.gamesPlayed + 1, gamesWon: stats.gamesWon + (result.won ? 1 : 0), totalTime: stats.totalTime + result.timeSeconds, totalHints: stats.totalHints + result.hintsUsed, lastGame: result, history: [result, ...stats.history].slice(0, 50), bestTime: { ...stats.bestTime }, bestHints: { ...stats.bestHints } };
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
  showStats: boolean; showResult: boolean;
  startNewGame: (d?: Difficulty) => void; setDifficulty: (d: Difficulty) => void;
  setCellState: (r: number, c: number, state: 'empty' | 'x' | 'crown') => void;
  cycleCell: (r: number, c: number) => void; undo: () => void; reset: () => void;
  useHint: () => void; endGame: (won: boolean) => void; tick: () => void;
  toggleStats: () => void; dismissResult: () => void;
}

function buildNewGame(d: Difficulty) {
  const cfg = DIFFICULTY_CONFIG[d]; const p = generatePuzzle(cfg.size);
  return { difficulty: d, size: cfg.size, cells: p.cells, solution: p.queens, history: [p.cells.map(r => r.map(c => ({ ...c })))], errors: [], errorCount: 0, timeSeconds: 0, isRunning: true, isGameOver: false, hasWon: false, hintsUsed: 0, lastResult: null, showResult: false };
}

export const useQueensStore = create<QueensState>((set, get) => ({
  difficulty: 'normal', size: 8, cells: null, solution: null, history: [], errors: [], errorCount: 0, timeSeconds: 0, isRunning: false, isGameOver: false, hasWon: false, hintsUsed: 0, lastResult: null, stats: loadStats(), showStats: false, showResult: false,
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
    if (nec >= MAX_ERRORS) { setTimeout(() => get().endGame(false), 300); return; }
    if (isSolved(ng, state.size)) setTimeout(() => get().endGame(true), 350);
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
    const cleared = state.cells.map(row => row.map(c => ({ ...c, state: 'empty' as const, hasError: false, hintExclude: false })));
    set({ cells: cleared, history: [cleared.map(row => row.map(c => ({ ...c })))], errors: [], errorCount: 0 });
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
    const result: QueensStats = { timeSeconds: state.timeSeconds, hintsUsed: state.hintsUsed, won, difficulty: state.difficulty, gridSize: state.size, date: new Date().toISOString() };
    const ns = recordGame(state.stats, result);
    set({ isRunning: false, isGameOver: true, hasWon: won, lastResult: result, stats: ns, showResult: true });
  },
  tick: () => { const state = get(); if (!state.isRunning) return; set({ timeSeconds: state.timeSeconds + 1 }); },
  toggleStats: () => set(s => ({ showStats: !s.showStats })),
  dismissResult: () => set({ showResult: false }),
}));
