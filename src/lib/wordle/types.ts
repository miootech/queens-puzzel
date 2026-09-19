// ─── Wordle but better! — Types ───

export type GameMode = 'classic' | 'hidden' | 'dual' | 'emoji';
export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';
export type EmojiCategory = 'animals' | 'food' | 'colors' | 'sport';

export interface GuessResult {
  letter: string;
  state: LetterState;
}

export interface ModeStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  // Guess distribution: index 0 = solved in 1, index 5 = solved in 6
  distribution: number[]; // length 6
}

export interface GameSettings {
  pastel: boolean; // true = pastel colors, false = classic wordle colors
  hardMode: boolean;
  darkKeyboard: boolean;
}

export interface PersistentStats {
  modes: Record<GameMode, ModeStats>;
  lastPlayed: Record<GameMode, string | null>; // ISO date for daily
  dailyCompleted: Record<GameMode, string | null>; // YYYY-MM-DD
}

export const INITIAL_MODE_STATS: ModeStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
};

export const INITIAL_STATS: PersistentStats = {
  modes: {
    classic: { ...INITIAL_MODE_STATS },
    hidden: { ...INITIAL_MODE_STATS },
    dual: { ...INITIAL_MODE_STATS },
    emoji: { ...INITIAL_MODE_STATS },
  },
  lastPlayed: { classic: null, hidden: null, dual: null, emoji: null },
  dailyCompleted: { classic: null, hidden: null, dual: null, emoji: null },
};

export const DEFAULT_SETTINGS: GameSettings = {
  pastel: false,  // Default: Original-Wordle-Farben (1:1 wie wordle.gg)
  hardMode: false,
  darkKeyboard: true,
};

export const MODE_CONFIG: Record<GameMode, {
  label: string;
  description: string;
  wordLength: number;
  maxGuesses: number;
  emoji?: boolean;
}> = {
  classic: { label: 'Classic',  description: 'The original Wordle · 5 letters · 6 guesses',  wordLength: 5, maxGuesses: 6 },
  hidden:  { label: 'Hidden',   description: 'Colors unlock per guess (from right)',          wordLength: 5, maxGuesses: 6 },
  dual:    { label: 'Dual',     description: '2 words at once · 6 guesses for both',          wordLength: 5, maxGuesses: 6 },
  emoji:   { label: 'Emoji',    description: 'Guess the emoji sequence · 5 emojis',          wordLength: 5, maxGuesses: 6, emoji: true },
};

// ─── Color Presets ───
// 1:1 wie wordle.gg / NYT Wordle Dark Theme
export const COLOR_PRESETS = {
  // Original Wordle dark theme colors
  classic: {
    correct: '#6AAA64', // Wordle Grün
    present: '#C9B458', // Wordle Yellow
    absent:  '#3A3A3C', // Wordle Grau
    empty:   'transparent',
    tbd:     'transparent',
    borderEmpty: '#3A3A3C', // Border für leere Tiles
    borderTbd:   '#565758', // Border für Tiles mit Buchstabe (noch nicht submitted)
    border: '#3A3A3C',
  },
  // Pastel-Variante (sanfter, Apple-Style)
  pastel: {
    correct: '#A8D4A0',
    present: '#E8D88A',
    absent:  '#3A3A3C',
    empty:   'transparent',
    tbd:     'transparent',
    borderEmpty: '#3A3A3C',
    borderTbd:   '#565758',
    border: '#3A3A3C',
  },
};

// ─── Emoji Sets ───
export const EMOJI_SETS: Record<EmojiCategory, { emoji: string; name: string }[]> = {
  animals: [
    { emoji: '🐶', name: 'Dog' },     { emoji: '🐱', name: 'Cat' },     { emoji: '🦊', name: 'Fox' },
    { emoji: '🐻', name: 'Bear' },    { emoji: '🐼', name: 'Panda' },   { emoji: '🦁', name: 'Lion' },
    { emoji: '🦄', name: 'Unicorn' }, { emoji: '🐢', name: 'Turtle' },  { emoji: '🐝', name: 'Bee' },
    { emoji: '🦋', name: 'Butterfly' },
  ],
  food: [
    { emoji: '🍎', name: 'Apple' },  { emoji: '🍕', name: 'Pizza' },   { emoji: '🍔', name: 'Burger' },
    { emoji: '🍟', name: 'Fries' },   { emoji: '🍜', name: 'Noodles' }, { emoji: '🍰', name: 'Cake' },
    { emoji: '🍩', name: 'Donut' },   { emoji: '🥑', name: 'Avocado' }, { emoji: '🍓', name: 'Strawberry' },
    { emoji: '🥕', name: 'Carrot' },
  ],
  colors: [
    { emoji: '🔴', name: 'Red' },     { emoji: '🟠', name: 'Orange' },  { emoji: '🟡', name: 'Yellow' },
    { emoji: '🟢', name: 'Green' },   { emoji: '🔵', name: 'Blue' },   { emoji: '🟣', name: 'Purple' },
    { emoji: '⚫', name: 'Black' },   { emoji: '⚪', name: 'White' },  { emoji: '🟤', name: 'Brown' },
    { emoji: '🟪', name: 'Pink' },
  ],
  sport: [
    { emoji: '⚽', name: 'Soccer' },  { emoji: '🏀', name: 'Basketball' }, { emoji: '🏈', name: 'Football' },
    { emoji: '🎾', name: 'Tennis' },  { emoji: '🏐', name: 'Volleyball' },  { emoji: '🏓', name: 'Pingpong' },
    { emoji: '🎱', name: 'Pool' },   { emoji: '🥊', name: 'Boxing' },      { emoji: '🥋', name: 'Judo' },
    { emoji: '⛳', name: 'Golf' },
  ],
};
