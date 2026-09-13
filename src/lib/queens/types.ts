// Queens puzzle type definitions — standalone app.

export type CellState = 'empty' | 'x' | 'crown';

// Subtle pastel colors for regions — muted, elegant Apple-style
export const REGION_COLORS = [
  '#E8A598', '#E8C887', '#E8D88A', '#A8D4A0', '#9CCFC4',
  '#9CBFD9', '#B8A5C9', '#D9A5A0', '#B5B5B5', '#D4B896',
  '#A5B8D4', '#C4A5B8',
];

export interface Cell {
  row: number;
  col: number;
  regionId: number;
  state: CellState;
  hasError: boolean;
  hintExclude?: boolean;
}

export type Difficulty = 'easy' | 'normal' | 'extreme';

export interface QueensStats {
  timeSeconds: number;
  hintsUsed: number;
  won: boolean;
  difficulty: Difficulty;
  gridSize: number;
  date: string;
}

export interface PersistentStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: Record<Difficulty, number | null>;
  bestHints: Record<Difficulty, number | null>;
  totalTime: number;
  totalHints: number;
  lastGame: QueensStats | null;
  history: QueensStats[];
}

export const INITIAL_STATS: PersistentStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: { easy: null, normal: null, extreme: null },
  bestHints: { easy: null, normal: null, extreme: null },
  totalTime: 0,
  totalHints: 0,
  lastGame: null,
  history: [],
};

export const DIFFICULTY_CONFIG = {
  easy:    { size: 6,  label: 'Easy',    description: '6×6 Raster · 6 Regionen' },
  normal:  { size: 8,  label: 'Normal',  description: '8×8 Raster · 8 Regionen' },
  extreme: { size: 12, label: 'Extrem',  description: '12×12 Raster · 12 Regionen' },
} as const;

export const MAX_HINTS = 3;
export const MAX_ERRORS = 3;
