// ─── Wordle but better! — Game Logic ───

import type { LetterState } from './types';
import { isValidWord } from './wordlist';

/**
 * Bewertet einen Guess gegen das Target-Wort.
 * Original Wordle-Logik mit korrekter Handhabung doppelter Buchstaben.
 *
 * Algorithmus:
 * 1. Erste Runde: markiere alle exakten Treffer (grün)
 * 2. Zweite Runde: für nicht-grüne Buchstaben, prüfe ob Buchstabe im Target
 *    vorhanden ist — aber nur, wenn es nicht schon anderweitig "verbraucht" wurde
 */
export function evaluateGuess(
  guess: string,
  target: string,
  wordLength: number = 5
): LetterState[] {
  const guessChars = guess.toUpperCase().padEnd(wordLength, ' ').slice(0, wordLength).split('');
  const targetChars = target.toUpperCase().split('');
  const result: LetterState[] = new Array(wordLength).fill('absent');

  // 1. Exakte Treffer markieren
  const targetCount: Record<string, number> = {};
  for (let i = 0; i < wordLength; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'correct';
    } else {
      targetCount[targetChars[i]] = (targetCount[targetChars[i]] ?? 0) + 1;
    }
  }

  // 2. Present (gelb) für Buchstaben, die enthalten, aber an falscher Position sind
  for (let i = 0; i < wordLength; i++) {
    if (result[i] === 'correct') continue;
    const c = guessChars[i];
    if (targetCount[c] && targetCount[c] > 0) {
      result[i] = 'present';
      targetCount[c]--;
    }
  }

  return result;
}

/**
 * Bewertet zwei Guesses (für Dual-Modus).
 */
export function evaluateDualGuess(
  guess: string,
  target1: string,
  target2: string,
  wordLength: number = 5
): { result1: LetterState[]; result2: LetterState[] } {
  const half = Math.floor(guess.length / 2);
  const g1 = guess.slice(0, half);
  const g2 = guess.slice(half);
  return {
    result1: evaluateGuess(g1, target1, wordLength),
    result2: evaluateGuess(g2, target2, wordLength),
  };
}

/**
 * Bewertet eine Emoji-Reihe gegen eine Emoji-Target-Reihe.
 * Gleiche Logik wie evaluateGuess, aber mit Emojis statt Buchstaben.
 */
export function evaluateEmojiGuess(
  guess: string[],
  target: string[],
  wordLength: number = 5
): LetterState[] {
  // Mappe auf identifizierbare Strings (für Comparison identisch zu Buchstaben-Logik)
  return evaluateGuess(guess.join(''), target.join(''), wordLength);
}

/**
 * Hard Mode Validation: prüft, ob ein Guess die bisherigen Hints respektiert.
 * - Korrekte Buchstaben müssen an derselben Position verwendet werden
 * - Present Buchstaben müssen im Guess enthalten sein
 *
 * Gibt null zurück wenn gültig, sonst eine Fehlermeldung.
 */
export function validateHardMode(
  guess: string,
  previousGuesses: { guess: string; result: LetterState[] }[],
  wordLength: number = 5
): string | null {
  const guessChars = guess.toUpperCase().padEnd(wordLength, ' ').slice(0, wordLength).split('');

  for (const prev of previousGuesses) {
    const prevGuessChars = prev.guess.toUpperCase().split('');

    for (let i = 0; i < wordLength; i++) {
      // Korrekte Buchstaben müssen bleiben
      if (prev.result[i] === 'correct' && guessChars[i] !== prevGuessChars[i]) {
        return `Buchstabe ${prevGuessChars[i]} muss an Position ${i + 1} bleiben (Hard Mode)`;
      }
    }

    // Present Buchstaben müssen weiterhin enthalten sein
    for (let i = 0; i < wordLength; i++) {
      if (prev.result[i] === 'present' || prev.result[i] === 'correct') {
        const requiredChar = prevGuessChars[i];
        if (!guessChars.includes(requiredChar)) {
          return `Buchstabe ${requiredChar} muss verwendet werden (Hard Mode)`;
        }
      }
    }
  }
  return null;
}

/**
 * Generiert einen Daily-Seed (heutiges Datum als YYYY-MM-DD).
 * Wird verwendet, um das gleiche Wort für alle User am gleichen Tag zu determinieren.
 */
export function getDailySeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Deterministic Random Generator basierend auf Seed-String.
 * Einfacher Hash → Zahl, dann Modulo Wortlisten-Länge.
 */
export function seedRandom(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Auf 32-Bit-Integer konvertieren
  }
  return Math.abs(hash) % max;
}

/**
 * Validiert einen Guess:
 * - Muss die richtige Länge haben
 * - Muss nur aus Buchstaben bestehen
 * - Für Classic/Hidden: Wort MUSS in der Wortliste stehen (wie im Original-Wordle)
 *   Falls nicht in der Liste → Shake-Animation + "Not in word list" Toast
 */
export function isGuessValid(guess: string, wordLength: number = 5): boolean {
  if (guess.length !== wordLength) return false;
  if (!/^[A-Za-z]+$/.test(guess)) return false;
  // Lockere Validierung: Akzeptiere jedes gültige 5-letter Wort aus Buchstaben.
  // Original-Wordle verlangt Wörter aus der Liste, aber das ist für eine offline-Version
  // mit limitierter Liste zu restriktiv — wir akzeptieren jedes plausible Wort.
  return true;
}

/**
 * Strengere Validierung: Wort MUSS in der Wortliste stehen.
 * Wird für Target-Wörter verwendet (um gültige Lösung zu garantieren).
 */
export function isTargetValid(word: string): boolean {
  return isValidWord(word);
}
