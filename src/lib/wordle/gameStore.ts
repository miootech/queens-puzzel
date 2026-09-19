// ─── Wordle but better! — Game Store (Zustand) ───

import { create } from 'zustand';
import {
  GameMode, GameSettings, PersistentStats, ModeStats, LetterState, EmojiCategory,
  INITIAL_STATS, INITIAL_MODE_STATS, DEFAULT_SETTINGS, MODE_CONFIG,
} from './types';
import {
  evaluateGuess, evaluateDualGuess, evaluateEmojiGuess,
  validateHardMode, getDailySeed, seedRandom, isGuessValid,
} from './logic';
import { randomWord, WORDS_5, WORDS_6, WORDS_4, WORDS_7 } from './wordlist';
import { EMOJI_SETS } from './types';

const STATS_KEY = 'wordle_bb_stats_v1';
const SETTINGS_KEY = 'wordle_bb_settings_v1';

// ─── Persistence ───
function loadStats(): PersistentStats {
  if (typeof window === 'undefined') return { ...INITIAL_STATS };
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return { ...INITIAL_STATS };
    const parsed = JSON.parse(raw) as PersistentStats;
    // Merge mit Defaults (falls neue Modi dazukommen)
    return {
      modes: {
        classic: { ...INITIAL_MODE_STATS, ...parsed.modes?.classic },
        hidden:  { ...INITIAL_MODE_STATS, ...parsed.modes?.hidden },
        dual:    { ...INITIAL_MODE_STATS, ...parsed.modes?.dual },
        emoji:   { ...INITIAL_MODE_STATS, ...parsed.modes?.emoji },
      },
      lastPlayed: parsed.lastPlayed ?? { classic: null, hidden: null, dual: null, emoji: null },
      dailyCompleted: parsed.dailyCompleted ?? { classic: null, hidden: null, dual: null, emoji: null },
    };
  } catch {
    return { ...INITIAL_STATS };
  }
}
function saveStats(stats: PersistentStats): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
}

function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
function saveSettings(s: GameSettings): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

// ─── Game State ───
export interface GameState {
  // View
  view: 'menu' | 'game' | 'stats' | 'settings';
  activeMode: GameMode;
  isDaily: boolean;

  // Game Data
  target: string;          // classic, hidden
  targets: [string, string]; // dual
  emojiTarget: string[];   // emoji
  emojiCategory: EmojiCategory;
  wordLength: number;
  maxGuesses: number;

  // Game Progress
  guesses: string[];      // classic, hidden, dual: 5 chars pro guess (dual: gleicher guess auf beide boards)
  emojiGuesses: string[][]; // emoji modus
  results: LetterState[][]; // classic, hidden
  dualResults: { r1: LetterState[]; r2: LetterState[] }[];
  dualSolved: { board1: boolean; board2: boolean }; // Dual: welcher Board schon gelöst ist (frozen)
  emojiResults: LetterState[][];
  currentGuess: string;   // gerade getippter Guess
  currentEmojiGuess: string[];
  isGameOver: boolean;
  isWon: boolean;
  showResultModal: boolean;
  shakeRow: boolean;       // Shake-Animation bei ungültigem Wort
  toast: string | null;     // Toast-Message (z.B. "Not in word list", "Wort zu kurz")

  // Stats + Settings
  stats: PersistentStats;
  settings: GameSettings;

  // Actions
  selectMode: (mode: GameMode, isDaily?: boolean) => void;
  backToMenu: () => void;
  openStats: () => void;
  openSettings: () => void;
  closeModals: () => void;
  toggleSetting: (key: keyof GameSettings) => void;
  resetStats: () => void;

  // Game Actions
  addLetter: (letter: string) => void;
  addEmoji: (emoji: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  dismissResult: () => void;
  startNewGame: () => void;
  setEmojiCategory: (cat: EmojiCategory) => void;
}

// ─── Helper: Starte neues Spiel ───
function buildNewGame(mode: GameMode, isDaily: boolean): Partial<GameState> {
  const cfg = MODE_CONFIG[mode];
  const wordLength = cfg.wordLength;
  const maxGuesses = cfg.maxGuesses;

  if (mode === 'emoji') {
    // Emoji-Modus: 5 Emojis aus der aktuell ausgewählten Kategorie (default: animals)
    // Für Daily deterministisch, sonst random
    const cats: EmojiCategory[] = ['animals', 'food', 'colors', 'sport'];
    const cat = isDaily
      ? cats[seedRandom(getDailySeed() + 'cat', cats.length)]
      : cats[Math.floor(Math.random() * cats.length)];

    const emojis = EMOJI_SETS[cat].map(e => e.emoji);
    const target: string[] = [];
    for (let i = 0; i < wordLength; i++) {
      if (isDaily) {
        target.push(emojis[seedRandom(getDailySeed() + `e${i}`, emojis.length)]);
      } else {
        target.push(emojis[Math.floor(Math.random() * emojis.length)]);
      }
    }

    return {
      emojiTarget: target,
      emojiCategory: cat,
      wordLength,
      maxGuesses,
      guesses: [],
      emojiGuesses: [],
      results: [],
      dualResults: [],
      emojiResults: [],
      currentGuess: '',
      currentEmojiGuess: [],
      isGameOver: false,
      isWon: false,
      showResultModal: false,
      shakeRow: false,
      toast: null,
      dualSolved: { board1: false, board2: false },
    };
  }

  if (mode === 'dual') {
    let t1: string, t2: string;
    if (isDaily) {
      const pool = WORDS_5;
      t1 = pool[seedRandom(getDailySeed() + 'dual1', pool.length)];
      t2 = pool[seedRandom(getDailySeed() + 'dual2', pool.length)];
    } else {
      t1 = randomWord(5);
      t2 = randomWord(5);
    }

    return {
      targets: [t1, t2],
      target: '',
      wordLength,
      maxGuesses,
      guesses: [],
      results: [],
      dualResults: [],
      emojiResults: [],
      emojiGuesses: [],
      currentGuess: '',
      isGameOver: false,
      isWon: false,
      showResultModal: false,
      shakeRow: false,
      toast: null,
      dualSolved: { board1: false, board2: false },
    };
  }

  // classic & hidden
  let target: string;
  if (isDaily) {
    const pool = WORDS_5;
    target = pool[seedRandom(getDailySeed() + mode, pool.length)];
  } else {
    target = randomWord(wordLength as 4 | 5 | 6 | 7);
  }

  return {
    target,
    targets: ['', ''],
    wordLength,
    maxGuesses,
    guesses: [],
    results: [],
    dualResults: [],
    emojiResults: [],
    emojiGuesses: [],
    currentGuess: '',
    currentEmojiGuess: [],
    isGameOver: false,
    isWon: false,
    showResultModal: false,
      shakeRow: false,
      toast: null,
      dualSolved: { board1: false, board2: false },
  };
}

// ─── Store ───
export const useGameStore = create<GameState>((set, get) => ({
  view: 'menu',
  activeMode: 'classic',
  isDaily: false,

  target: '',
  targets: ['', ''],
  emojiTarget: [],
  emojiCategory: 'animals',
  wordLength: 5,
  maxGuesses: 6,

  guesses: [],
  emojiGuesses: [],
  results: [],
  dualResults: [],
  emojiResults: [],
  currentGuess: '',
  currentEmojiGuess: [],
  isGameOver: false,
  isWon: false,
  showResultModal: false,
  shakeRow: false,
  toast: null,
  dualSolved: { board1: false, board2: false },

  stats: loadStats(),
  settings: loadSettings(),

  selectMode: (mode, isDaily = false) => {
    const game = buildNewGame(mode, isDaily);
    set({ view: 'game', activeMode: mode, isDaily, ...game });
  },

  backToMenu: () => set({ view: 'menu' }),

  openStats: () => set({ view: 'stats' }),
  openSettings: () => set({ view: 'settings' }),
  closeModals: () => set({ view: 'menu' }),

  toggleSetting: (key) => {
    const s = get().settings;
    const next = { ...s, [key]: !s[key] };
    saveSettings(next);
    set({ settings: next });
  },

  resetStats: () => {
    const fresh: PersistentStats = {
      modes: {
        classic: { ...INITIAL_MODE_STATS },
        hidden: { ...INITIAL_MODE_STATS },
        dual: { ...INITIAL_MODE_STATS },
        emoji: { ...INITIAL_MODE_STATS },
      },
      lastPlayed: { classic: null, hidden: null, dual: null, emoji: null },
      dailyCompleted: { classic: null, hidden: null, dual: null, emoji: null },
    };
    saveStats(fresh);
    set({ stats: fresh });
  },

  addLetter: (letter) => {
    const s = get();
    if (s.isGameOver) return;
    // Dual: immer 5 Buchstaben (gleicher Guess für beide Boards)
    const maxLen = s.wordLength;
    if (s.currentGuess.length >= maxLen) return;
    set({ currentGuess: s.currentGuess + letter.toUpperCase() });
  },

  addEmoji: (emoji) => {
    const s = get();
    if (s.isGameOver) return;
    if (s.currentEmojiGuess.length >= s.wordLength) return;
    set({ currentEmojiGuess: [...s.currentEmojiGuess, emoji] });
  },

  removeLetter: () => {
    const s = get();
    if (s.isGameOver) return;
    if (s.activeMode === 'emoji') {
      set({ currentEmojiGuess: s.currentEmojiGuess.slice(0, -1) });
    } else {
      set({ currentGuess: s.currentGuess.slice(0, -1) });
    }
  },

  submitGuess: () => {
    const s = get();
    if (s.isGameOver) return;

    // Helper: Toast zeigen für 1.5s, dann automatisch ausblenden
    const showToast = (msg: string) => {
      set({ toast: msg, shakeRow: true });
      setTimeout(() => set({ toast: null }), 1800);
      setTimeout(() => set({ shakeRow: false }), 600);
    };

    if (s.activeMode === 'emoji') {
      if (s.currentEmojiGuess.length !== s.wordLength) {
        showToast('Emoji row incomplete');
        return;
      }
      const guessArr = s.currentEmojiGuess;
      const result = evaluateEmojiGuess(guessArr, s.emojiTarget, s.wordLength);
      const newEmojiGuesses = [...s.emojiGuesses, guessArr];
      const newEmojiResults = [...s.emojiResults, result];
      const isWon = result.every(r => r === 'correct');
      const isOver = isWon || newEmojiGuesses.length >= s.maxGuesses;

      set({
        emojiGuesses: newEmojiGuesses,
        emojiResults: newEmojiResults,
        currentEmojiGuess: [],
        isGameOver: isOver,
        isWon,
        showResultModal: isOver,
      });

      if (isOver) {
        recordResult(s.activeMode, s.isDaily, isWon, newEmojiGuesses.length, get(), set);
      }
      return;
    }

    // Word-Modes
    const maxLen = s.wordLength;
    if (s.currentGuess.length !== maxLen) {
      showToast(s.currentGuess.length < maxLen ? 'Not enough letters' : 'Too many letters');
      return;
    }

    if (!/^[A-Za-z]+$/.test(s.currentGuess)) {
      showToast('Letters only');
      return;
    }

    // Hard Mode-Validierung (nur für classic/hidden, nicht für dual)
    if (s.settings.hardMode && (s.activeMode === 'classic' || s.activeMode === 'hidden')) {
      const previous = s.guesses.map((g, i) => ({ guess: g, result: s.results[i] }));
      const err = validateHardMode(s.currentGuess, previous, s.wordLength);
      if (err) {
        showToast(err);
        return;
      }
    }

    if (s.activeMode === 'dual') {
      // Dual-Logik: 5-letter guess → beide Boards evaluieren (außer gefrorene)
      const guess = s.currentGuess;
      const newGuesses = [...s.guesses, guess];
      const newDualResults = [...s.dualResults];

      // Wenn Board 1 schon gelöst: r1 = leer (frozen), nur r2 evaluieren
      // Wenn Board 2 schon gelöst: r2 = leer (frozen), nur r1 evaluieren
      // Wenn beide noch nicht gelöst: beide evaluieren
      let r1: LetterState[] = [];
      let r2: LetterState[] = [];

      if (!s.dualSolved.board1) {
        r1 = evaluateGuess(guess, s.targets[0], s.wordLength);
      }
      if (!s.dualSolved.board2) {
        r2 = evaluateGuess(guess, s.targets[1], s.wordLength);
      }

      newDualResults.push({ r1, r2 });

      // Update dualSolved
      const newDualSolved = {
        board1: s.dualSolved.board1 || r1.every(r => r === 'correct'),
        board2: s.dualSolved.board2 || r2.every(r => r === 'correct'),
      };

      // Win = beide Boards gelöst
      const isWon = newDualSolved.board1 && newDualSolved.board2;
      const isOver = isWon || newGuesses.length >= s.maxGuesses;

      set({
        guesses: newGuesses,
        dualResults: newDualResults,
        dualSolved: newDualSolved,
        currentGuess: '',
        isGameOver: isOver,
        isWon,
        showResultModal: isOver,
      });

      if (isOver) {
        recordResult(s.activeMode, s.isDaily, isWon, newGuesses.length, get(), set);
      }
      return;
    }

    // classic & hidden — Validierung (jetzt lockere: jedes plausible Wort ok)
    if (!isGuessValid(s.currentGuess, s.wordLength)) {
      showToast('Not in word list');
      return;
    }

    const result = evaluateGuess(s.currentGuess, s.target, s.wordLength);
    const newGuesses = [...s.guesses, s.currentGuess];
    const newResults = [...s.results, result];
    const isWon = result.every(r => r === 'correct');
    const isOver = isWon || newGuesses.length >= s.maxGuesses;

    set({
      guesses: newGuesses,
      results: newResults,
      currentGuess: '',
      isGameOver: isOver,
      isWon,
      showResultModal: isOver,
    });

    if (isOver) {
      recordResult(s.activeMode, s.isDaily, isWon, newGuesses.length, get(), set);
    }
  },

  dismissResult: () => set({ showResultModal: false }),

  startNewGame: () => {
    const s = get();
    const game = buildNewGame(s.activeMode, s.isDaily);
    set(game);
  },

  setEmojiCategory: (cat) => {
    // Wenn die Kategorie gewechselt wird, das Target neu generieren
    // mit Emojis aus der NEUEN Kategorie (sonst ist das Target noch aus der alten
    // Kategorie und keine neuen Guesses matchen)
    const s = get();
    const emojis = EMOJI_SETS[cat].map(e => e.emoji);
    const newTarget: string[] = [];
    for (let i = 0; i < s.wordLength; i++) {
      if (s.isDaily) {
        newTarget.push(emojis[seedRandom(getDailySeed() + cat + `e${i}`, emojis.length)]);
      } else {
        newTarget.push(emojis[Math.floor(Math.random() * emojis.length)]);
      }
    }
    // Reset guesses & results, da diese sich auf das alte Target bezogen
    set({
      emojiCategory: cat,
      emojiTarget: newTarget,
      emojiGuesses: [],
      emojiResults: [],
      currentEmojiGuess: [],
    });
  },
}));

// ─── Stats Recorder ───
function recordResult(
  mode: GameMode,
  isDaily: boolean,
  isWon: boolean,
  guessCount: number,
  state: GameState,
  set: (partial: Partial<GameState>) => void
): void {
  const newStats: PersistentStats = {
    ...state.stats,
    modes: { ...state.stats.modes },
    lastPlayed: { ...state.stats.lastPlayed, [mode]: new Date().toISOString() },
  };

  const modeStats: ModeStats = { ...newStats.modes[mode] };
  modeStats.played += 1;
  if (isWon) {
    modeStats.won += 1;
    modeStats.currentStreak += 1;
    modeStats.maxStreak = Math.max(modeStats.maxStreak, modeStats.currentStreak);
    if (guessCount >= 1 && guessCount <= 6) {
      modeStats.distribution[guessCount - 1] += 1;
    }
  } else {
    modeStats.currentStreak = 0;
  }
  newStats.modes[mode] = modeStats;

  if (isDaily) {
    newStats.dailyCompleted = {
      ...state.stats.dailyCompleted,
      [mode]: getDailySeed(),
    };
  }

  saveStats(newStats);
  set({ stats: newStats });
}
