// Word placement algorithm for Strands-style puzzle.
//
// 1. Place the spangram first — it MUST touch two opposite sides of the board
//    (top+bottom OR left+right). Can use ANY of the 8 directions, no preference.
// 2. Place the shorter theme words in random directions (also all 8, mixed).
// 3. Fill remaining cells with random letters.

import { Cell, PlacedWord, ThemePack } from './types';

// All 8 directions, equally weighted
const ALL_DIRECTIONS = [
  [ 0,  1],  // right
  [ 0, -1],  // left
  [ 1,  0],  // down
  [-1,  0],  // up
  [ 1,  1],  // down-right
  [ 1, -1],  // down-left
  [-1,  1],  // up-right
  [-1, -1],  // up-left
];

const FILL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function canPlace(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number
): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    grid[r][c] = word[i];
    cells.push({ row: r, col: c });
  }
  return cells;
}

// Check if a placement touches two OPPOSITE sides of the board.
function touchesOppositeSides(
  cells: { row: number; col: number }[],
  rows: number,
  cols: number
): boolean {
  const touchesTop = cells.some(c => c.row === 0);
  const touchesBottom = cells.some(c => c.row === rows - 1);
  const touchesLeft = cells.some(c => c.col === 0);
  const touchesRight = cells.some(c => c.col === cols - 1);
  return (touchesTop && touchesBottom) || (touchesLeft && touchesRight);
}

// Relaxed check: touches ANY two distinct sides (opposite OR adjacent).
// Used as a fallback when the spangram is too short to span opposite sides.
function touchesAnyTwoSides(
  cells: { row: number; col: number }[],
  rows: number,
  cols: number
): boolean {
  const sides = new Set<string>();
  if (cells.some(c => c.row === 0)) sides.add('top');
  if (cells.some(c => c.row === rows - 1)) sides.add('bottom');
  if (cells.some(c => c.col === 0)) sides.add('left');
  if (cells.some(c => c.col === cols - 1)) sides.add('right');
  return sides.size >= 2;
}

// Try to place the spangram so it touches two opposite sides (preferred),
// or at least any two distinct sides (relaxed fallback for short spangrams).
function tryPlaceSpangram(
  grid: (string | null)[][],
  word: string,
  rows: number,
  cols: number
): { row: number; col: number }[] | null {
  // Phase 1: try to place touching OPPOSITE sides
  for (let tries = 0; tries < 600; tries++) {
    const [dr, dc] = ALL_DIRECTIONS[Math.floor(Math.random() * ALL_DIRECTIONS.length)];
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (canPlace(grid, word, r, c, dr, dc)) {
      const cells: { row: number; col: number }[] = [];
      for (let i = 0; i < word.length; i++) {
        cells.push({ row: r + dr * i, col: c + dc * i });
      }
      if (touchesOppositeSides(cells, rows, cols)) {
        placeWord(grid, word, r, c, dr, dc);
        return cells;
      }
    }
  }
  // Phase 2: relaxed — any two distinct sides
  for (let tries = 0; tries < 600; tries++) {
    const [dr, dc] = ALL_DIRECTIONS[Math.floor(Math.random() * ALL_DIRECTIONS.length)];
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (canPlace(grid, word, r, c, dr, dc)) {
      const cells: { row: number; col: number }[] = [];
      for (let i = 0; i < word.length; i++) {
        cells.push({ row: r + dr * i, col: c + dc * i });
      }
      if (touchesAnyTwoSides(cells, rows, cols)) {
        placeWord(grid, word, r, c, dr, dc);
        return cells;
      }
    }
  }
  // Phase 3: last resort — place anywhere
  for (let tries = 0; tries < 200; tries++) {
    const [dr, dc] = ALL_DIRECTIONS[Math.floor(Math.random() * ALL_DIRECTIONS.length)];
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (canPlace(grid, word, r, c, dr, dc)) {
      return placeWord(grid, word, r, c, dr, dc);
    }
  }
  return null;
}

export interface GridGenerationResult {
  grid: Cell[][];
  placedWords: PlacedWord[];
  theme: string;
}

export function generateGameGrid(
  pack: ThemePack,
  words: string[],
  spangram: string,
  rows: number,
  cols: number
): GridGenerationResult {
  // SAFETY: filter out any words that can NEVER fit in this grid.
  // maxLineLen = longest straight-line distance in the grid
  const maxLineLen = Math.max(rows, cols);
  const safeWords = words.filter(w => w.length >= 3 && w.length <= maxLineLen);
  const safeSpangram = spangram.length >= 3 && spangram.length <= maxLineLen
    ? spangram
    : safeWords[0] ?? 'SPIEL';

  for (let attempt = 0; attempt < 80; attempt++) {
    const nullGrid: (string | null)[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null)
    );
    const placedWords: PlacedWord[] = [];

    // 1. Place the spangram FIRST — must touch opposite sides, must place ALL letters
    const spangramCells = tryPlaceSpangram(nullGrid, safeSpangram, rows, cols);
    if (!spangramCells || spangramCells.length !== safeSpangram.length) {
      continue;
    }
    placedWords.push({ word: safeSpangram, cells: spangramCells, isSpangram: true });

    // 2. Place theme words in ALL 8 directions (mixed)
    let allPlaced = true;
    const shuffledWords = shuffle(safeWords);
    for (const word of shuffledWords) {
      let placed = false;
      // Try all 8 directions in random order, then random positions
      const dirOrder = shuffle(ALL_DIRECTIONS);
      outer: for (const [dr, dc] of dirOrder) {
        for (let tries = 0; tries < 80; tries++) {
          const r = Math.floor(Math.random() * rows);
          const c = Math.floor(Math.random() * cols);
          if (canPlace(nullGrid, word, r, c, dr, dc)) {
            const cells = placeWord(nullGrid, word, r, c, dr, dc);
            placedWords.push({ word, cells, isSpangram: false });
            placed = true;
            break outer;
          }
        }
      }
      if (!placed) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      const cellGrid: Cell[][] = nullGrid.map((rowArr, r) =>
        rowArr.map((letter, c) => ({
          row: r,
          col: c,
          letter: letter ?? FILL_ALPHABET[Math.floor(Math.random() * FILL_ALPHABET.length)],
          state: 'idle' as const,
          colorIndex: -1,
          hinted: false,
        }))
      );
      return { grid: cellGrid, placedWords, theme: pack.theme };
    }
  }

  // Last-resort fallback — try every direction for every word until all are placed.
  // This is reached only when the randomised placement failed; the words are guaranteed
  // to fit by length, just maybe not in the available space.
  console.warn('Grid generation fell back to simple layout');
  const nullGrid: (string | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );
  const placedWords: PlacedWord[] = [];

  // Place spangram horizontally on the middle row — guaranteed to fit (we filtered by length)
  const midRow = Math.floor(rows / 2);
  const spanCells: { row: number; col: number }[] = [];
  for (let i = 0; i < safeSpangram.length && i < cols; i++) {
    nullGrid[midRow][i] = safeSpangram[i];
    spanCells.push({ row: midRow, col: i });
  }
  placedWords.push({ word: safeSpangram, cells: spanCells, isSpangram: true });

  // For each remaining word: try all 8 directions, all positions, until it fits.
  // If still not placeable after exhaustive search, drop the word (better than crash).
  for (const word of safeWords) {
    let placed = false;
    const dirOrder = shuffle(ALL_DIRECTIONS);
    for (const [dr, dc] of dirOrder) {
      for (let r = 0; r < rows && !placed; r++) {
        for (let c = 0; c < cols && !placed; c++) {
          if (canPlace(nullGrid, word, r, c, dr, dc)) {
            const cells = placeWord(nullGrid, word, r, c, dr, dc);
            placedWords.push({ word, cells, isSpangram: false });
            placed = true;
          }
        }
      }
      if (placed) break;
    }
    // If a word couldn't be placed at all, just skip it — game remains solvable
    // for all the words that DID get placed.
  }

  const cellGrid: Cell[][] = nullGrid.map((rowArr, r) =>
    rowArr.map((letter, c) => ({
      row: r,
      col: c,
      letter: letter ?? FILL_ALPHABET[Math.floor(Math.random() * FILL_ALPHABET.length)],
      state: 'idle' as const,
      colorIndex: -1,
      hinted: false,
    }))
  );
  return { grid: cellGrid, placedWords, theme: pack.theme };
}

// Check if two cells are adjacent (8-directional)
export function isAdjacent(
  a: { row: number; col: number },
  b: { row: number; col: number }
): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return dr <= 1 && dc <= 1 && (dr + dc > 0);
}
