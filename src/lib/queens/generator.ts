// Procedural Queens puzzle generator.
// Region 0 is the "easy region" (1-3 cells), rest grow dynamically.

import { Cell } from './types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface GeneratedPuzzle {
  size: number;
  cells: Cell[][];
  queens: { row: number; col: number }[];
  regionIds: number[][];
}

function placeQueens(n: number): { row: number; col: number }[] | null {
  for (let attempt = 0; attempt < 2000; attempt++) {
    const cols = shuffle(Array.from({ length: n }, (_, i) => i));
    const queens = cols.map((col, row) => ({ row, col }));
    let ok = true;
    for (let i = 0; i < queens.length && ok; i++) {
      for (let j = i + 1; j < queens.length && ok; j++) {
        const dr = Math.abs(queens[i].row - queens[j].row);
        const dc = Math.abs(queens[i].col - queens[j].col);
        if (dr === 1 && dc <= 1) ok = false;
      }
    }
    if (ok) return queens;
  }
  if (n === 5) return [{row:0,col:2},{row:1,col:0},{row:2,col:3},{row:3,col:1},{row:4,col:4}];
  if (n === 6) return [{row:0,col:3},{row:1,col:0},{row:2,col:4},{row:3,col:1},{row:4,col:5},{row:5,col:2}];
  if (n === 7) return [{row:0,col:3},{row:1,col:0},{row:2,col:4},{row:3,col:1},{row:4,col:5},{row:5,col:2},{row:6,col:6}];
  if (n === 8) return [{row:0,col:4},{row:1,col:1},{row:2,col:5},{row:3,col:0},{row:4,col:6},{row:5,col:3},{row:6,col:7},{row:7,col:2}];
  if (n === 9) return [{row:0,col:4},{row:1,col:1},{row:2,col:5},{row:3,col:8},{row:4,col:2},{row:5,col:6},{row:6,col:0},{row:7,col:3},{row:8,col:7}];
  if (n === 12) return [{row:0,col:5},{row:1,col:0},{row:2,col:7},{row:3,col:2},{row:4,col:9},{row:5,col:4},{row:6,col:11},{row:7,col:6},{row:8,col:1},{row:9,col:8},{row:10,col:3},{row:11,col:10}];
  // 15×15: Ultra Pro Max Femboy Extreme Mode — keine 2 Queens dürfen sich diagonal berühren
  if (n === 15) return [{row:0,col:5},{row:1,col:0},{row:2,col:7},{row:3,col:2},{row:4,col:9},{row:5,col:4},{row:6,col:11},{row:7,col:6},{row:8,col:13},{row:9,col:1},{row:10,col:8},{row:11,col:3},{row:12,col:10},{row:13,col:14},{row:14,col:12}];
  const cols = shuffle(Array.from({ length: n }, (_, i) => i));
  return cols.map((col, row) => ({ row, col }));
}

function growRegions(size: number, queens: { row: number; col: number }[]): number[][] {
  const regionIds: number[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => -1));
  const dirs4 = [[-1,0],[1,0],[0,-1],[0,1]];
  queens.forEach((q, i) => { regionIds[q.row][q.col] = i; });

  // Easy region (region 0): 1-3 cells
  const easyQueen = queens[0];
  const easyTargetSize = 1 + Math.floor(Math.random() * 3);
  let easyCellCount = 1;
  const easyFrontier = new Set<string>();
  for (const [dr, dc] of dirs4) {
    const r = easyQueen.row + dr, c = easyQueen.col + dc;
    if (r >= 0 && r < size && c >= 0 && c < size && regionIds[r][c] === -1) easyFrontier.add(`${r},${c}`);
  }
  while (easyCellCount < easyTargetSize && easyFrontier.size > 0) {
    const cells = Array.from(easyFrontier);
    const pick = cells[Math.floor(Math.random() * cells.length)];
    const [r, c] = pick.split(',').map(Number);
    easyFrontier.delete(pick);
    if (regionIds[r][c] !== -1) continue;
    regionIds[r][c] = 0;
    easyCellCount++;
    for (const [dr, dc] of dirs4) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && regionIds[nr][nc] === -1) easyFrontier.add(`${nr},${nc}`);
    }
  }

  // Other regions: BFS
  const totalCells = size * size;
  let claimed = queens.length + (easyCellCount - 1);
  const frontiers: Set<string>[] = queens.map((q, i) => {
    const s = new Set<string>();
    if (i === 0) return s;
    for (const [dr, dc] of dirs4) {
      const r = q.row + dr, c = q.col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size && regionIds[r][c] === -1) s.add(`${r},${c}`);
    }
    return s;
  });

  let safetyRounds = 0;
  while (claimed < totalCells && safetyRounds < totalCells * 4) {
    safetyRounds++;
    const order = shuffle(Array.from({ length: queens.length }, (_, i) => i).filter(i => i !== 0));
    let progressed = false;
    for (const regionIdx of order) {
      const frontier = frontiers[regionIdx];
      if (frontier.size === 0) continue;
      const cells = Array.from(frontier);
      const pick = cells[Math.floor(Math.random() * cells.length)];
      const [r, c] = pick.split(',').map(Number);
      if (regionIds[r][c] !== -1) { frontier.delete(pick); continue; }
      regionIds[r][c] = regionIdx;
      frontier.delete(pick);
      claimed++;
      progressed = true;
      for (const [dr, dc] of dirs4) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && regionIds[nr][nc] === -1) frontier.add(`${nr},${nc}`);
      }
    }
    if (!progressed) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (regionIds[r][c] === -1) {
            for (const [dr, dc] of shuffle(dirs4)) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size && regionIds[nr][nc] !== -1 && regionIds[nr][nc] !== 0) {
                regionIds[r][c] = regionIds[nr][nc]; claimed++; break;
              }
            }
            if (regionIds[r][c] === -1) { regionIds[r][c] = 1; claimed++; }
          }
        }
      }
      break;
    }
  }
  return regionIds;
}

// ── splitRegions: macht 50-75% der Regionen "split" (nicht-zusammenhängend) ──
// Für jede Region, die "split" sein soll, wird ein 2x3 oder 3x2 Blob an einer
// anderen Stelle im Grid platziert. Diese Cells werden dieser Region zugewiesen
// (egal welcher Region sie vorher angehörten). Queen-Cells werden geschont.
//
// Beispiel: Region Blau hat 2x3 unten links + 5 Cells in der Mitte.
//
// Da Queens nicht bewegt werden, bleibt das Puzzle lösbar (jede Region hat
// weiterhin genau 1 Queen, jede Row/Col 1 Queen, keine 2 Queens diagonal benachbart).
function splitRegions(
  regionIds: number[][],
  queens: { row: number; col: number }[],
  splitPercent: number,
  size: number
): number[][] {
  const newRegionIds = regionIds.map(row => [...row]);
  const numRegions = queens.length;
  const splitPct = 0.5 + Math.random() * 0.25; // 50-75%
  const numToSplit = Math.max(1, Math.floor(numRegions * splitPct));

  // Queen-Positions als Set für schnelle Lookup
  const queenSet = new Set(queens.map(q => `${q.row},${q.col}`));

  // Pick which regions to split (random shuffle)
  const regionIndices = Array.from({ length: numRegions }, (_, i) => i);
  for (let i = regionIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [regionIndices[i], regionIndices[j]] = [regionIndices[j], regionIndices[i]];
  }
  const regionsToSplit = regionIndices.slice(0, numToSplit);

  // For each region to split, place a 2x3 or 3x2 "blob" elsewhere
  for (const targetR of regionsToSplit) {
    const blobW = Math.random() < 0.5 ? 2 : 3;
    const blobH = blobW === 2 ? 3 : 2;

    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      const startR = Math.floor(Math.random() * (size - blobH + 1));
      const startC = Math.floor(Math.random() * (size - blobW + 1));

      // Check: Blob darf nicht mit targetR's existierenden Cells überlappen
      // UND darf keine Queen enthalten
      let overlapsOwn = false;
      let containsQueen = false;
      for (let dr = 0; dr < blobH; dr++) {
        for (let dc = 0; dc < blobW; dc++) {
          const r = startR + dr;
          const c = startC + dc;
          if (newRegionIds[r][c] === targetR) { overlapsOwn = true; break; }
          if (queenSet.has(`${r},${c}`)) { containsQueen = true; break; }
        }
        if (overlapsOwn || containsQueen) break;
      }
      if (overlapsOwn || containsQueen) continue;

      // Reassign alle Cells im Blob zu targetR
      for (let dr = 0; dr < blobH; dr++) {
        for (let dc = 0; dc < blobW; dc++) {
          newRegionIds[startR + dr][startC + dc] = targetR;
        }
      }
      placed = true;
    }
  }

  return newRegionIds;
}

// ── splitRegionsFixed: splittet genau N von Total Regionen (fest) ──
// Im Femboy-Modus: 8 von 12 Regionen werden gesplittet (2/3 split-Ratio)
// Für jede zu splittende Region: platziere einen 2x3 oder 3x2 Blob an einer
// anderen Stelle im Grid und weise diese Cells der target-Region zu.
function splitRegionsFixed(
  regionIds: number[][],
  queens: { row: number; col: number }[],
  numToSplit: number,
  size: number
): number[][] {
  const newRegionIds = regionIds.map(row => [...row]);
  const numRegions = queens.length;

  // Queen-Positions als Set für schnelle Lookup
  const queenSet = new Set(queens.map(q => `${q.row},${q.col}`));

  // Pick which regions to split (random shuffle, then take first numToSplit)
  const regionIndices = Array.from({ length: numRegions }, (_, i) => i);
  for (let i = regionIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [regionIndices[i], regionIndices[j]] = [regionIndices[j], regionIndices[i]];
  }
  const regionsToSplit = regionIndices.slice(0, numToSplit);

  // For each region to split, place a 2x3 or 3x2 "blob" elsewhere
  for (const targetR of regionsToSplit) {
    const blobW = Math.random() < 0.5 ? 2 : 3;
    const blobH = blobW === 2 ? 3 : 2;

    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      const startR = Math.floor(Math.random() * (size - blobH + 1));
      const startC = Math.floor(Math.random() * (size - blobW + 1));

      // Check: Blob darf nicht mit targetR's existierenden Cells überlappen
      // UND darf keine Queen enthalten
      let overlapsOwn = false;
      let containsQueen = false;
      for (let dr = 0; dr < blobH; dr++) {
        for (let dc = 0; dc < blobW; dc++) {
          const r = startR + dr;
          const c = startC + dc;
          if (newRegionIds[r][c] === targetR) { overlapsOwn = true; break; }
          if (queenSet.has(`${r},${c}`)) { containsQueen = true; break; }
        }
        if (overlapsOwn || containsQueen) break;
      }
      if (overlapsOwn || containsQueen) continue;

      // Reassign alle Cells im Blob zu targetR
      for (let dr = 0; dr < blobH; dr++) {
        for (let dc = 0; dc < blobW; dc++) {
          newRegionIds[startR + dr][startC + dc] = targetR;
        }
      }
      placed = true;
    }
  }

  return newRegionIds;
}

export function generatePuzzle(size: number): GeneratedPuzzle {
  // Femboy-Modus (15×15): verwende 12 Queens/12 Regionen statt 15
  // (User will 12 Regionen mit 8 davon gesplittet = 2/3 split-Ratio)
  const isFemboy = size === 15;
  const numQueens = isFemboy ? 12 : size;

  for (let attempt = 0; attempt < 50; attempt++) {
    let queens: { row: number; col: number }[] | null = null;
    if (isFemboy) {
      // Für 12 Queens auf 15×15: verteile Queens auf 12 der 15 Rows (random)
      // und 12 der 15 Cols (random), dann permutiere für diagonal-Konflikt-Freiheit
      for (let inner = 0; inner < 2000 && !queens; inner++) {
        const rows = shuffle(Array.from({ length: size }, (_, i) => i)).slice(0, numQueens).sort((a, b) => a - b);
        const cols = shuffle(Array.from({ length: size }, (_, i) => i)).slice(0, numQueens);
        // Shuffle cols until no diagonal conflict
        let ok = false;
        for (let i = 0; i < 100; i++) {
          const candidate = cols.map((col, idx) => ({ row: rows[idx], col }));
          let valid = true;
          for (let a = 0; a < candidate.length && valid; a++) {
            for (let b = a + 1; b < candidate.length; b++) {
              const dr = Math.abs(candidate[a].row - candidate[b].row);
              const dc = Math.abs(candidate[a].col - candidate[b].col);
              if (dr <= 1 && dc <= 1 && (dr + dc > 0)) { valid = false; break; }
            }
          }
          if (valid) { queens = candidate; ok = true; break; }
          // re-shuffle cols
          for (let k = cols.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (k + 1));
            [cols[k], cols[j]] = [cols[j], cols[k]];
          }
        }
      }
      // Fallback falls kein valid placement gefunden
      if (!queens) {
        queens = [
          { row: 0, col: 3 }, { row: 1, col: 7 }, { row: 2, col: 11 },
          { row: 3, col: 1 }, { row: 4, col: 5 }, { row: 5, col: 9 },
          { row: 6, col: 13 }, { row: 7, col: 4 }, { row: 8, col: 8 },
          { row: 9, col: 12 }, { row: 10, col: 0 }, { row: 11, col: 14 },
        ];
      }
    } else {
      queens = placeQueens(numQueens);
      if (!queens) continue;
    }
    const regionIds = growRegions(size, queens);
    const regionQueenCount = new Array(numQueens).fill(0);
    for (const q of queens) regionQueenCount[regionIds[q.row][q.col]]++;
    if (regionQueenCount.some(c => c !== 1)) continue;

    // Für 15×15 (Femboy-Modus): 50-75% der Regionen splitten (dynamisch)
    let finalRegionIds = regionIds;
    if (isFemboy) {
      // 50-75% von 12 = 6 bis 9 Regionen werden gesplittet
      const splitPct = 0.5 + Math.random() * 0.25;
      const numToSplit = Math.max(1, Math.floor(numQueens * splitPct));
      finalRegionIds = splitRegionsFixed(regionIds, queens, numToSplit, size);
      // Verify: nach Split muss jede Region noch genau 1 Queen haben
      const postSplitQueenCount = new Array(numQueens).fill(0);
      for (const q of queens) postSplitQueenCount[finalRegionIds[q.row][q.col]]++;
      if (postSplitQueenCount.some(c => c !== 1)) continue; // retry
    }

    const cells: Cell[][] = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => ({ row: r, col: c, regionId: finalRegionIds[r][c], state: 'empty' as const, hasError: false })))
    ;
    return { size, cells, queens, regionIds: finalRegionIds };
  }
  console.warn('Queens generation fell back');
  const queens = placeQueens(numQueens) ?? Array.from({ length: numQueens }, (_, i) => ({ row: i, col: i }));
  const regionIds: number[][] = Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => c % numQueens));
  const cells: Cell[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => ({ row: r, col: c, regionId: regionIds[r][c], state: 'empty' as const, hasError: false }))
  );
  return { size, cells, queens, regionIds };
}

export function validateBoard(cells: Cell[][], size: number): { row: number; col: number }[] {
  const errors: { row: number; col: number }[] = [];
  const crowns: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (cells[r][c].state === 'crown') crowns.push({ row: r, col: c });
  for (let i = 0; i < crowns.length; i++) for (let j = i + 1; j < crowns.length; j++) {
    const dr = Math.abs(crowns[i].row - crowns[j].row), dc = Math.abs(crowns[i].col - crowns[j].col);
    if (dr <= 1 && dc <= 1 && (dr + dc > 0)) { errors.push(crowns[i], crowns[j]); }
  }
  const byRow = new Map<number, { row: number; col: number }[]>();
  const byCol = new Map<number, { row: number; col: number }[]>();
  const byRegion = new Map<number, { row: number; col: number }[]>();
  for (const q of crowns) {
    if (!byRow.has(q.row)) byRow.set(q.row, []); byRow.get(q.row)!.push(q);
    if (!byCol.has(q.col)) byCol.set(q.col, []); byCol.get(q.col)!.push(q);
    if (!byRegion.has(cells[q.row][q.col].regionId)) byRegion.set(cells[q.row][q.col].regionId, []); byRegion.get(cells[q.row][q.col].regionId)!.push(q);
  }
  for (const list of byRow.values()) if (list.length > 1) errors.push(...list);
  for (const list of byCol.values()) if (list.length > 1) errors.push(...list);
  for (const list of byRegion.values()) if (list.length > 1) errors.push(...list);
  const seen = new Set<string>();
  return errors.filter(e => { const k = `${e.row},${e.col}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

export function isSolved(cells: Cell[][], size: number): boolean {
  // Bestimme erwartete Crown-Anzahl: bei Femboy (15×15) sind es 12, sonst = size
  const expectedCrowns = size === 15 ? 12 : size;
  const crowns: { row: number; col: number; regionId: number }[] = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (cells[r][c].state === 'crown') crowns.push({ row: r, col: c, regionId: cells[r][c].regionId });
  if (crowns.length !== expectedCrowns) return false;
  const rows = new Set(crowns.map(c => c.row)), cols = new Set(crowns.map(c => c.col)), regions = new Set(crowns.map(c => c.regionId));
  if (rows.size !== expectedCrowns || cols.size !== expectedCrowns || regions.size !== expectedCrowns) return false;
  for (let i = 0; i < crowns.length; i++) for (let j = i + 1; j < crowns.length; j++) {
    const dr = Math.abs(crowns[i].row - crowns[j].row), dc = Math.abs(crowns[i].col - crowns[j].col);
    if (dr <= 1 && dc <= 1 && (dr + dc > 0)) return false;
  }
  return true;
}
