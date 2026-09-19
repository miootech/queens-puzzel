// Game type definitions for Strands-style puzzle

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameView = 'menu' | 'difficulty' | 'playing' | 'gameover';

export type CellState = 'idle' | 'selecting' | 'found' | 'spangram' | 'error';

// Color palette for theme words (cycled). Spangram is always gold.
export const WORD_COLORS = [
  '#5DADE2', // sky blue
  '#AF7AC5', // amethyst
  '#48C9B0', // turquoise
  '#F1948A', // coral
  '#52BE80', // emerald
  '#F5B041', // orange
  '#EC7063', // red
] as const;

export const SPANGRAM_COLOR = '#F4D03F'; // gold yellow

export interface Cell {
  row: number;
  col: number;
  letter: string;
  state: CellState;
  // Index into WORD_COLORS for theme words, or -1 for spangram
  colorIndex: number; // -1 = none, -2 = spangram
  // Whether this cell is currently being hinted (pulsing)
  hinted: boolean;
}

export interface PlacedWord {
  word: string;
  cells: { row: number; col: number }[];
  isSpangram: boolean;
}

export interface ThemePack {
  theme: string;       // Theme name shown to player
  spangram: string;    // The spangram word (describes the theme)
  words: string[];     // The theme words (5-6 per pack)
}

export interface GameStats {
  timeSeconds: number;
  errors: number;
  hintsUsed: number;
  wordsFound: number;
  totalWords: number;
  spangramFound: boolean;
  won: boolean;
  difficulty: Difficulty;
  date: string;
}

export interface PersistentStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: Record<Difficulty, number | null>;
  bestErrors: Record<Difficulty, number | null>;
  totalTime: number;
  totalErrors: number;
  totalHintsUsed: number;
  lastGame: GameStats | null;
  history: GameStats[];
}

export const INITIAL_STATS: PersistentStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: { easy: null, medium: null, hard: null },
  bestErrors: { easy: null, medium: null, hard: null },
  totalTime: 0,
  totalErrors: 0,
  totalHintsUsed: 0,
  lastGame: null,
  history: [],
};

export const DIFFICULTY_CONFIG = {
  easy:   {
    rows: 8, cols: 6,
    themeWordCount: 3,
    maxErrors: 5,
    timeLimit: null as number | null,
    label: 'Leicht',
    description: '6×8 Raster · 3 Themenwörter + Spangram · kein Zeitlimit',
  },
  medium: {
    rows: 8, cols: 6,
    themeWordCount: 5,
    maxErrors: 5,
    timeLimit: null as number | null,
    label: 'Mittel',
    description: '6×8 Raster · 5 Themenwörter + Spangram · kein Zeitlimit',
  },
  hard: {
    rows: 8, cols: 6,
    themeWordCount: 6,
    maxErrors: 5,
    timeLimit: 180,
    label: 'Schwer',
    description: '6×8 Raster · 6 Themenwörter + Spangram · 3:00 Min.',
  },
} as const;

// Hint unlocks after this many wrong attempts
export const HINT_UNLOCK_THRESHOLD = 3;
