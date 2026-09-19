// Global game state managed by Zustand — Strands-style with spangram & hints.

import { create } from 'zustand';
import {
  Cell,
  Difficulty,
  GameStats,
  GameView,
  PersistentStats,
  PlacedWord,
  ThemePack,
  WORD_COLORS,
  HINT_UNLOCK_THRESHOLD,
} from './types';
import { DIFFICULTY_CONFIG } from './types';
import { generateGameGrid, GridGenerationResult } from './gridGenerator';
import {
  pickWordsForDifficulty,
  THEME_PACKS,
} from './wordlist';
import {
  getLastTheme,
  loadStats,
  recordGameResult,
  setLastTheme,
} from './stats';
import { playSound } from './sound';

interface GameState {
  view: GameView;
  difficulty: Difficulty | null;
  grid: Cell[][] | null;
  placedWords: PlacedWord[];
  theme: string;
  foundWords: string[];
  foundSpangram: boolean;
  errors: number;
  maxErrors: number;
  timeSeconds: number;
  timeLimit: number | null;
  isRunning: boolean;
  isGameOver: boolean;
  hasWon: boolean;
  lastResult: GameStats | null;
  stats: PersistentStats;
  hintsUsed: number;
  hintAvailable: boolean;
  hintCells: { row: number; col: number }[]; // up to 2 hint cells

  // Selection during drag
  selection: { row: number; col: number }[];
  isDragging: boolean;
  errorCells: { row: number; col: number }[];
  partialCells: { row: number; col: number }[]; // wordle-orange: partial match
  lastFoundCells: { row: number; col: number }[];
  lastFoundSpangram: boolean;

  // Sound
  muted: boolean;

  // Actions
  goToMenu: () => void;
  goToDifficulty: () => void;
  startGame: (difficulty: Difficulty) => void;
  restart: () => void;
  endGame: (won: boolean) => void;
  tick: () => void;
  setSelection: (sel: { row: number; col: number }[]) => void;
  addToSelection: (cell: { row: number; col: number }) => void;
  startDrag: (cell: { row: number; col: number }) => void;
  endDrag: () => void;
  cancelDrag: () => void;
  refreshStats: () => void;
  useHint: () => void;
  toggleMute: () => void;
}

function buildNewGame(difficulty: Difficulty): {
  grid: Cell[][];
  placedWords: PlacedWord[];
  theme: string;
} {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const lastTheme = getLastTheme();

  let pack: ThemePack;
  if (lastTheme) {
    const available = THEME_PACKS.filter(p => p.theme !== lastTheme);
    pack = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : THEME_PACKS[Math.floor(Math.random() * THEME_PACKS.length)];
  } else {
    pack = THEME_PACKS[Math.floor(Math.random() * THEME_PACKS.length)];
  }

  setLastTheme(pack.theme);

  // Max word length = longest straight line that fits in the grid
  // (diagonal would be sqrt(rows^2 + cols^2) but we cap at max(rows, cols)
  // for safety since straight lines are the most common placement)
  const maxLen = Math.max(cfg.rows, cfg.cols);
  const { words, spangram } = pickWordsForDifficulty(pack, cfg.themeWordCount, maxLen);
  const finalWords = words.length >= 3 ? words : pack.words.slice(0, cfg.themeWordCount);

  // SAFETY: filter spangram — if it can't fit, fall back to a shorter pack word
  const safeSpangram = spangram.length <= maxLen
    ? spangram
    : pack.words.find(w => w.length >= 4 && w.length <= maxLen) ?? spangram.slice(0, maxLen);

  const result: GridGenerationResult = generateGameGrid(
    pack,
    finalWords,
    safeSpangram,
    cfg.rows,
    cfg.cols
  );
  return { grid: result.grid, placedWords: result.placedWords, theme: result.theme };
}

// Check if the player's selection is a PARTIAL match of any unfound word.
// "Partial" = the word formed is an anagram of letters from a real word, OR
// the selection contains the right letters but in a different cell ordering.
// For Wordle-orange: the cells selected belong to a real unfound word, but the
// path order is wrong, OR the selection is a subset of cells from a real word.
function findPartialMatch(
  selection: { row: number; col: number }[],
  placedWords: PlacedWord[],
  foundWords: string[],
  foundSpangram: boolean
): boolean {
  const selSet = new Set(selection.map(s => `${s.row},${s.col}`));
  const remaining = placedWords.filter(
    pw => !foundWords.includes(pw.word) && !(foundSpangram && pw.isSpangram)
  );

  for (const pw of remaining) {
    const wordCells = new Set(pw.cells.map(c => `${c.row},${c.col}`));
    // If at least 2 selected cells belong to this word but not all → partial
    let overlap = 0;
    for (const sel of selection) {
      if (wordCells.has(`${sel.row},${sel.col}`)) overlap++;
    }
    if (overlap >= 2 && overlap < pw.cells.length) return true;
  }
  return false;
}

export const useGameStore = create<GameState>((set, get) => ({
  view: 'menu',
  difficulty: null,
  grid: null,
  placedWords: [],
  theme: '',
  foundWords: [],
  foundSpangram: false,
  errors: 0,
  maxErrors: 5,
  timeSeconds: 0,
  timeLimit: null,
  isRunning: false,
  isGameOver: false,
  hasWon: false,
  lastResult: null,
  stats: loadStats(),
  hintsUsed: 0,
  hintAvailable: false,
  hintCells: [],
  selection: [],
  isDragging: false,
  errorCells: [],
  partialCells: [],
  lastFoundCells: [],
  lastFoundSpangram: false,
  muted: false,

  goToMenu: () => set({
    view: 'menu',
    isRunning: false,
    isGameOver: false,
    grid: null,
    selection: [],
    isDragging: false,
    hintCells: [],
  }),

  goToDifficulty: () => set({ view: 'difficulty' }),

  startGame: (difficulty) => {
    const { grid, placedWords, theme } = buildNewGame(difficulty);
    const cfg = DIFFICULTY_CONFIG[difficulty];
    set({
      view: 'playing',
      difficulty,
      grid,
      placedWords,
      theme,
      foundWords: [],
      foundSpangram: false,
      errors: 0,
      maxErrors: cfg.maxErrors,
      timeSeconds: 0,
      timeLimit: cfg.timeLimit,
      isRunning: true,
      isGameOver: false,
      hasWon: false,
      lastResult: null,
      hintsUsed: 0,
      hintAvailable: false,
      hintCells: [],
      selection: [],
      isDragging: false,
      errorCells: [],
      partialCells: [],
      lastFoundCells: [],
      lastFoundSpangram: false,
    });
  },

  restart: () => {
    const { difficulty } = get();
    if (!difficulty) {
      set({ view: 'menu' });
      return;
    }
    get().startGame(difficulty);
  },

  endGame: (won) => {
    const state = get();
    if (state.isGameOver) return;
    const result: GameStats = {
      timeSeconds: state.timeSeconds,
      errors: state.errors,
      hintsUsed: state.hintsUsed,
      wordsFound: state.foundWords.length + (state.foundSpangram ? 1 : 0),
      totalWords: state.placedWords.length,
      spangramFound: state.foundSpangram,
      won,
      difficulty: state.difficulty ?? 'medium',
      date: new Date().toISOString(),
    };
    const newStats = recordGameResult(state.stats, result);
    playSound(won ? 'win' : 'lose');
    set({
      isRunning: false,
      isGameOver: true,
      hasWon: won,
      lastResult: result,
      stats: newStats,
      view: 'gameover',
      selection: [],
      isDragging: false,
      hintCells: [],
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning) return;
    const next = state.timeSeconds + 1;
    if (state.timeLimit !== null) {
      const remaining = state.timeLimit - next;
      if (remaining <= 10 && remaining > 0) {
        playSound('tick');
      }
      if (next >= state.timeLimit) {
        set({ timeSeconds: state.timeLimit });
        get().endGame(false);
        return;
      }
    }
    set({ timeSeconds: next });
  },

  setSelection: (sel) => set({ selection: sel }),

  addToSelection: (cell) => {
    const state = get();
    if (!state.isDragging || !state.grid) return;
    const last = state.selection[state.selection.length - 1];
    if (last && last.row === cell.row && last.col === cell.col) return;

    // BACK-DRAG: if the cell is the second-to-last in the selection,
    // treat this as "undo last" — pop the last cell off the selection.
    // This lets the player drag backwards along their own path.
    if (state.selection.length >= 2) {
      const secondLast = state.selection[state.selection.length - 2];
      if (secondLast.row === cell.row && secondLast.col === cell.col) {
        set({ selection: state.selection.slice(0, -1) });
        return;
      }
    }

    if (last) {
      const dr = Math.abs(last.row - cell.row);
      const dc = Math.abs(last.col - cell.col);
      if (dr > 1 || dc > 1 || (dr === 0 && dc === 0)) return;
    }
    const already = state.selection.some(s => s.row === cell.row && s.col === cell.col);
    if (already) return;
    playSound('select');
    set({ selection: [...state.selection, cell] });
  },

  cancelDrag: () => set({ isDragging: false, selection: [] }),

  endDrag: () => {
    const state = get();
    if (!state.isDragging || !state.grid) {
      set({ isDragging: false, selection: [] });
      return;
    }
    if (state.selection.length < 2) {
      set({ isDragging: false, selection: [] });
      return;
    }

    const word = state.selection
      .map(s => state.grid![s.row][s.col].letter)
      .join('');

    const remaining = state.placedWords.filter(
      pw => !state.foundWords.includes(pw.word) &&
            !(state.foundSpangram && pw.isSpangram)
    );
    const match = remaining.find(pw => pw.word === word);

    if (match) {
      // WORD FOUND — Wordle green (theme words) or gold (spangram)
      const newGrid = state.grid.map(row => row.map(c => ({ ...c })));
      const colorIndex = match.isSpangram ? -2 : state.foundWords.length % WORD_COLORS.length;
      match.cells.forEach(({ row, col }) => {
        newGrid[row][col].state = match.isSpangram ? 'spangram' : 'found';
        newGrid[row][col].colorIndex = colorIndex;
        newGrid[row][col].hinted = false;
      });

      if (match.isSpangram) {
        playSound('spangram');
        const allFound = state.foundWords.length + 1 === state.placedWords.length;
        set({
          grid: newGrid,
          foundSpangram: true,
          selection: [],
          isDragging: false,
          errorCells: [],
          partialCells: [],
          lastFoundCells: match.cells,
          lastFoundSpangram: true,
          hintCells: [],
        });
        if (allFound) {
          setTimeout(() => get().endGame(true), 800);
        }
      } else {
        playSound('correct');
        const newFound = [...state.foundWords, match.word];
        const allFound = newFound.length === state.placedWords.length - 1 && state.foundSpangram;
        const allFoundWithoutSpangram = newFound.length === state.placedWords.length;
        set({
          grid: newGrid,
          foundWords: newFound,
          selection: [],
          isDragging: false,
          errorCells: [],
          partialCells: [],
          lastFoundCells: match.cells,
          lastFoundSpangram: false,
          hintCells: [],
        });
        if (allFound || allFoundWithoutSpangram) {
          setTimeout(() => get().endGame(true), 800);
        }
      }
    } else {
      // Wrong word — check if it's a PARTIAL match (Wordle orange) or fully wrong (red)
      const isPartial = findPartialMatch(
        state.selection,
        state.placedWords,
        state.foundWords,
        state.foundSpangram
      );

      const errorCells = [...state.selection];
      const newGrid = state.grid.map(row => row.map(c => ({ ...c })));
      errorCells.forEach(({ row, col }) => {
        if (newGrid[row][col].state !== 'found' && newGrid[row][col].state !== 'spangram') {
          newGrid[row][col].state = 'error';
        }
      });
      const newErrors = state.errors + 1;
      playSound('error');
      const newHintAvailable = newErrors >= HINT_UNLOCK_THRESHOLD &&
        (state.foundWords.length + (state.foundSpangram ? 1 : 0) < state.placedWords.length);
      if (newHintAvailable && !state.hintAvailable) {
        setTimeout(() => playSound('hint'), 300);
      }
      set({
        grid: newGrid,
        errors: newErrors,
        selection: [],
        isDragging: false,
        errorCells,
        partialCells: isPartial ? errorCells : [],
        hintAvailable: newHintAvailable,
      });
      // After a short flash, reset error cells
      setTimeout(() => {
        const cur = get();
        if (!cur.grid) return;
        const restored = cur.grid.map(row => row.map(c => ({ ...c })));
        errorCells.forEach(({ row, col }) => {
          if (restored[row][col].state === 'error') {
            restored[row][col].state = 'idle';
          }
        });
        set({ grid: restored, errorCells: [], partialCells: [] });
        if (newErrors >= cur.maxErrors) {
          cur.endGame(false);
        }
      }, 500);
    }
  },

  useHint: () => {
    const state = get();
    if (!state.hintAvailable || !state.grid) return;
    // Find the first unfound word and highlight the first TWO cells.
    // The hint stays visible until the player finds this word (or starts a new drag).
    const remaining = state.placedWords.filter(
      pw => !state.foundWords.includes(pw.word) &&
            !(state.foundSpangram && pw.isSpangram)
    );
    if (remaining.length === 0) return;
    const target = remaining[0];
    const hintCells = target.cells.slice(0, Math.min(2, target.cells.length));
    const newGrid = state.grid.map(row => row.map(c => ({ ...c })));
    hintCells.forEach(({ row, col }) => {
      newGrid[row][col].hinted = true;
    });
    playSound('hint');
    set({
      grid: newGrid,
      hintsUsed: state.hintsUsed + 1,
      hintCells,
      hintAvailable: false,
    });
    // NOTE: hint stays visible until the hinted word is found (handled in endDrag
    // when a match clears `hintCells`), OR until the player starts a new drag
    // (handled in startDrag). No setTimeout auto-clear anymore.
  },

  startDrag: (cell) => {
    const state = get();
    if (!state.grid || state.isGameOver) return;
    playSound('tap');
    // Clear any active hint when a new drag starts
    let gridToSet = state.grid;
    if (state.hintCells.length > 0) {
      gridToSet = state.grid.map(row => row.map(c => ({ ...c })));
      state.hintCells.forEach(({ row, col }) => {
        gridToSet[row][col].hinted = false;
      });
    }
    set({
      isDragging: true,
      selection: [cell],
      grid: gridToSet,
      hintCells: [],
    });
  },

  toggleMute: () => {
    const newMuted = !get().muted;
    set({ muted: newMuted });
    import('./sound').then(({ setMuted }) => setMuted(newMuted));
  },

  refreshStats: () => set({ stats: loadStats() }),
}));
