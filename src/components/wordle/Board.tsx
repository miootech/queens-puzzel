'use client';

import { motion } from 'framer-motion';
import { Tile } from './Tile';
import { useGameStore } from '@/lib/wordle/gameStore';
import type { LetterState } from '@/lib/wordle/types';

const TILE_GAP = 'gap-[5px]';
const TILE_GAP_DUAL = 'gap-[8px]';

// ─── Classic Board ───
export function ClassicBoard() {
  const { guesses, results, currentGuess, wordLength, maxGuesses, isGameOver, shakeRow } = useGameStore();

  return (
    <div className="flex flex-col items-center gap-[5px]">
      {Array.from({ length: maxGuesses }).map((_, r) => {
        const isCurrentRow = r === guesses.length && !isGameOver;
        const guess = guesses[r] ?? '';
        const result = results[r] ?? [];

        return (
          <motion.div
            key={r}
            animate={isCurrentRow && shakeRow ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={isCurrentRow && shakeRow ? { duration: 0.5 } : {}}
            className={`flex ${TILE_GAP}`}
          >
            {Array.from({ length: wordLength }).map((__, c) => {
              const letter = isCurrentRow ? (currentGuess[c] ?? '') : guess[c] ?? '';
              const state: LetterState = result[c] ?? (letter ? 'tbd' : 'empty');
              const revealed = !!result[c];
              return <Tile key={c} letter={letter} state={state} revealed={revealed} index={c} size="md" />;
            })}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Hidden Board ───
// Normales Classic-Wordle-Gameplay, ABER:
// In jeder Row sind die ersten (5-N) Slots mit "?" verdeckt (fest, von Anfang an).
// N = row index + 1 (Row 1 → N=1, Row 2 → N=2, ..., Row 5+ → N=5)
// User-Input wird nur in den letzten N Slots angezeigt — die ersten (5-N) Slots
// bleiben verdeckt mit "?", egal was man tippt.
//
// Nach Submit: gleiche Logik — verdeckte Slots zeigen "?", sichtbare Slots zeigen
// Buchstabe + Color-Evaluation.
//
// Row 1: ????X (4 ?, 1 sichtbar) — User tippt 5 Buchstaben, sieht aber nur Slot 5
// Row 2: ???XX (3 ?, 2 sichtbar)
// Row 3: ??XXX (2 ?, 3 sichtbar)
// Row 4: ?XXXX (1 ?, 4 sichtbar)
// Row 5: XXXXX (alle sichtbar — volle Info wie Classic)
// Row 6: XXXXX (immer noch alle sichtbar, letzte Chance)
export function HiddenBoard() {
  const { guesses, results, currentGuess, wordLength, maxGuesses, isGameOver, shakeRow } = useGameStore();

  return (
    <div className="flex flex-col items-center gap-[5px]">
      {Array.from({ length: maxGuesses }).map((_, r) => {
        const isCurrentRow = r === guesses.length && !isGameOver;
        const guess = guesses[r] ?? '';
        const result = results[r] ?? [];
        const isSubmitted = r < guesses.length;
        // N = wie viele Slots von rechts sichtbar sind (Row 0 → 1, Row 1 → 2, ...)
        const visibleCount = Math.min(r + 1, wordLength);

        return (
          <motion.div
            key={r}
            animate={isCurrentRow && shakeRow ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={isCurrentRow && shakeRow ? { duration: 0.5 } : {}}
            className={`flex ${TILE_GAP}`}
          >
            {Array.from({ length: wordLength }).map((__, c) => {
              // Slot c ist sichtbar wenn c >= wordLength - visibleCount
              const isSlotVisible = c >= wordLength - visibleCount;

              if (!isSlotVisible) {
                // Verdeckter Slot: zeige "?" immer (egal ob User getippt hat oder nicht)
                return (
                  <Tile
                    key={c}
                    letter="?"
                    state="tbd"
                    revealed={false}
                    index={c}
                    size="md"
                  />
                );
              }

              // Sichtbarer Slot
              if (isCurrentRow) {
                // Aktuelle Row, sichtbarer Slot: zeige User-Input
                const letter = currentGuess[c] ?? '';
                const state: LetterState = letter ? 'tbd' : 'empty';
                return <Tile key={c} letter={letter} state={state} revealed={false} index={c} size="md" />;
              }

              if (isSubmitted) {
                // Submitted Row, sichtbarer Slot: zeige Buchstabe + Farbe
                const letter = guess[c] ?? '';
                const state: LetterState = result[c] ?? 'absent';
                return (
                  <Tile
                    key={c}
                    letter={letter}
                    state={state}
                    revealed={true}
                    index={c}
                    size="md"
                  />
                );
              }

              // Leere zukünftige Row, sichtbarer Slot: leer
              return <Tile key={c} letter="" state="empty" revealed={false} index={c} size="md" />;
            })}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Dual Board ───
// Beide Boards zeigen denselben 5-letter-Guess
// Wenn ein Board gelöst ist, wird es "frozen" (keine neuen Guesses mehr)
// Der Guess wird nur noch gegen das nicht gelöste Board evaluiert
export function DualBoard() {
  const { guesses, dualResults, currentGuess, wordLength, maxGuesses, isGameOver, shakeRow, dualSolved } = useGameStore();

  return (
    <div className="flex flex-col items-center gap-[5px]">
      {Array.from({ length: maxGuesses }).map((_, r) => {
        const isCurrentRow = r === guesses.length && !isGameOver;
        const guess = guesses[r] ?? '';
        const dr = dualResults[r] ?? { r1: [], r2: [] };

        return (
          <motion.div
            key={r}
            animate={isCurrentRow && shakeRow ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={isCurrentRow && shakeRow ? { duration: 0.5 } : {}}
            className={`flex ${TILE_GAP_DUAL}`}
          >
            {/* Board 1 */}
            <div className={`flex ${TILE_GAP}`}>
              {Array.from({ length: wordLength }).map((__, c) => {
                const letter = isCurrentRow ? (currentGuess[c] ?? '') : guess[c] ?? '';
                const state: LetterState = dr.r1[c] ?? (letter ? 'tbd' : 'empty');
                const revealed = !!dr.r1[c];
                return <Tile key={`a-${c}`} letter={letter} state={state} revealed={revealed} index={c} size="sm" />;
              })}
            </div>
            {/* Trenner */}
            <div className="mx-1 flex items-center">
              <div className="h-8 w-px bg-[#3A3A3C]" />
            </div>
            {/* Board 2 */}
            <div className={`flex ${TILE_GAP}`}>
              {Array.from({ length: wordLength }).map((__, c) => {
                const letter = isCurrentRow ? (currentGuess[c] ?? '') : guess[c] ?? '';
                const state: LetterState = dr.r2[c] ?? (letter ? 'tbd' : 'empty');
                const revealed = !!dr.r2[c];
                return <Tile key={`b-${c}`} letter={letter} state={state} revealed={revealed} index={c} size="sm" />;
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Emoji Board ───
export function EmojiBoard() {
  const { emojiGuesses, emojiResults, currentEmojiGuess, wordLength, maxGuesses, isGameOver, shakeRow } = useGameStore();

  return (
    <div className="flex flex-col items-center gap-[5px]">
      {Array.from({ length: maxGuesses }).map((_, r) => {
        const isCurrentRow = r === emojiGuesses.length && !isGameOver;
        const guess = emojiGuesses[r] ?? [];
        const result = emojiResults[r] ?? [];

        return (
          <motion.div
            key={r}
            animate={isCurrentRow && shakeRow ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={isCurrentRow && shakeRow ? { duration: 0.5 } : {}}
            className={`flex ${TILE_GAP}`}
          >
            {Array.from({ length: wordLength }).map((__, c) => {
              const emoji = isCurrentRow ? (currentEmojiGuess[c] ?? '') : guess[c] ?? '';
              const state: LetterState = result[c] ?? (emoji ? 'tbd' : 'empty');
              const revealed = !!result[c];
              return <Tile key={c} emoji={emoji} state={state} revealed={revealed} index={c} size="md" />;
            })}
          </motion.div>
        );
      })}
    </div>
  );
}
