'use client';

import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/lib/wordle/gameStore';
import type { LetterState } from '@/lib/wordle/types';
import { COLOR_PRESETS, EMOJI_SETS, type EmojiCategory } from '@/lib/wordle/types';

const WORDLE_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

// Wordle-Standard Keyboard Layout
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

// Best-Status für jeden Buchstaben über alle Guesses
function getBestLetterState(
  letter: string,
  guesses: string[],
  results: LetterState[][],
  wordLength: number
): LetterState {
  let best: LetterState = 'empty';
  for (let i = 0; i < guesses.length; i++) {
    const guess = guesses[i];
    const result = results[i];
    if (!result) continue;
    for (let j = 0; j < wordLength; j++) {
      if (guess[j] === letter) {
        if (result[j] === 'correct') return 'correct';
        else if (result[j] === 'present' && (best as LetterState) !== 'correct') best = 'present' as LetterState;
        else if (result[j] === 'absent' && (best as LetterState) === 'empty') best = 'absent' as LetterState;
      }
    }
  }
  return best;
}

// Gleiches für Dual-Modus (gleicher 5-letter Guess auf beide Boards)
// Kombiniere r1 und r2 des Guesses: nehme den "besten" Status pro Buchstabe
function getBestLetterStateDual(
  letter: string,
  guesses: string[],
  dualResults: { r1: LetterState[]; r2: LetterState[] }[],
  wordLength: number
): LetterState {
  let best: LetterState = 'empty';
  for (let i = 0; i < guesses.length; i++) {
    const guess = guesses[i];
    const dr = dualResults[i];
    if (!dr) continue;
    // Durchlaufe r1 und r2 (jeweils 5 Buchstaben)
    for (let j = 0; j < wordLength; j++) {
      if (guess[j] === letter) {
        // Prüfe r1[j] und r2[j] — nehme den besseren Status
        const states: LetterState[] = [dr.r1[j], dr.r2[j]].filter(s => s !== undefined);
        for (const s of states) {
          if (s === 'correct') return 'correct';
          else if (s === 'present' && (best as LetterState) !== 'correct') best = 'present' as LetterState;
          else if (s === 'absent' && (best as LetterState) === 'empty') best = 'absent' as LetterState;
        }
      }
    }
  }
  return best;
}

export function Keyboard() {
  const store = useGameStore();
  const pastel = store.settings.pastel;
  const colors = pastel ? COLOR_PRESETS.pastel : COLOR_PRESETS.classic;
  const { guesses, results, dualResults, activeMode, wordLength, addLetter, removeLetter, submitGuess } = store;

  const onKey = (key: string) => {
    if (key === 'ENTER') submitGuess();
    else if (key === 'BACK') removeLetter();
    else addLetter(key);
  };

  return (
    <div className="flex w-full flex-col items-center gap-[6px] select-none">
      {KEYBOARD_ROWS.map((row, ridx) => (
        <div key={ridx} className="flex w-full max-w-[500px] justify-center gap-[6px]">
          {row.map((key) => {
            const isAction = key === 'ENTER' || key === 'BACK';
            const best = isAction
              ? 'empty'
              : activeMode === 'dual'
                ? getBestLetterStateDual(key, guesses, dualResults, wordLength)
                : getBestLetterState(key, guesses, results, wordLength);

            // Wordle-Standard Farben:
            // - idle (empty): #818384 with white text
            // - correct: #6AAA64 with white text
            // - present: #C9B458 with white text
            // - absent: #3A3A3C with white text
            // - Action keys (ENTER/BACK): #565758
            const bg = isAction
              ? '#565758'
              : best === 'correct' ? colors.correct
              : best === 'present' ? colors.present
              : best === 'absent' ? colors.absent
              : '#818384';

            const textColor = '#ffffff';

            return (
              <motion.button
                key={key}
                onClick={() => onKey(key)}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                className={cn(
                  'flex h-[58px] items-center justify-center rounded-md font-bold uppercase transition-colors',
                  isAction ? 'text-[10px] tracking-wider min-w-[52px] flex-[1.5]' : 'flex-1 max-w-[43px] text-[16px]'
                )}
                style={{
                  backgroundColor: bg,
                  color: textColor,
                  fontFamily: WORDLE_FONT,
                  borderRadius: '6px',
                }}
              >
                {key === 'BACK' ? <Delete className="h-5 w-5" strokeWidth={2.5} /> : key}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Emoji Keyboard ───
export function EmojiKeyboard() {
  const store = useGameStore();
  const pastel = store.settings.pastel;
  const colors = pastel ? COLOR_PRESETS.pastel : COLOR_PRESETS.classic;
  const { emojiCategory, addEmoji, removeLetter, submitGuess, currentEmojiGuess, wordLength } = store;
  const emojis = EMOJI_SETS[emojiCategory];
  const categories: { id: EmojiCategory; label: string }[] = [
    { id: 'animals', label: 'Animals' },
    { id: 'food', label: 'Food' },
    { id: 'colors', label: 'Colors' },
    { id: 'sport', label: 'Sport' },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-2 select-none">
      {/* Kategorie-Tabs */}
      <div className="flex gap-1 rounded-md bg-[#1a1a1a] p-1 ring-1 ring-[#3A3A3C]">
        {categories.map(c => (
          <motion.button
            key={c.id}
            onClick={() => store.setEmojiCategory(c.id)}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'flex items-center justify-center rounded px-3 py-1.5 text-[11px] font-semibold transition-colors',
              emojiCategory === c.id ? 'bg-[#565758] text-white' : 'text-[#818384] hover:text-white'
            )}
            style={{ fontFamily: WORDLE_FONT }}
          >
            {c.label}
          </motion.button>
        ))}
      </div>

      {/* Emoji-Grid */}
      <div className="grid grid-cols-5 gap-[6px] w-full max-w-[500px]">
        {emojis.map((e, i) => (
          <motion.button
            key={i}
            onClick={() => addEmoji(e.emoji)}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            className="flex h-[58px] w-full items-center justify-center rounded-md bg-[#818384] text-2xl hover:bg-[#565758]"
          >
            {e.emoji}
          </motion.button>
        ))}
      </div>

      {/* Action-Row */}
      <div className="flex w-full max-w-[500px] gap-2">
        <motion.button
          onClick={removeLetter}
          whileTap={{ scale: 0.95 }}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#565758] py-3 text-sm font-medium text-white hover:bg-[#3A3A3C]"
          style={{ fontFamily: WORDLE_FONT }}
        >
          <Delete className="h-4 w-4" /> Delete
        </motion.button>
        <motion.button
          onClick={submitGuess}
          disabled={currentEmojiGuess.length !== wordLength}
          whileTap={{ scale: 0.95 }}
          className="flex flex-[2] items-center justify-center gap-2 rounded-md py-3 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: currentEmojiGuess.length === wordLength ? colors.correct : '#565758', fontFamily: WORDLE_FONT }}
        >
          Enter {currentEmojiGuess.length}/{wordLength}
        </motion.button>
      </div>
    </div>
  );
}
