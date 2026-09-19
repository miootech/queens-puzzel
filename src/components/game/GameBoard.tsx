'use client';

import { useRef, useCallback, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/game/gameStore';
import { WORD_COLORS, SPANGRAM_COLOR } from '@/lib/game/types';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  rows: number;
  cols: number;
}

interface CellBox {
  x: number;
  y: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
}

export function GameBoard({ rows, cols }: GameBoardProps) {
  const grid = useGameStore(s => s.grid);
  const selection = useGameStore(s => s.selection);
  const isDragging = useGameStore(s => s.isDragging);
  const errorCells = useGameStore(s => s.errorCells);
  const partialCells = useGameStore(s => s.partialCells);
  const lastFoundCells = useGameStore(s => s.lastFoundCells);
  const startDrag = useGameStore(s => s.startDrag);
  const addToSelection = useGameStore(s => s.addToSelection);
  const endDrag = useGameStore(s => s.endDrag);
  const cancelDrag = useGameStore(s => s.cancelDrag);

  const boardRef = useRef<HTMLDivElement>(null);
  const [cellBoxes, setCellBoxes] = useState<CellBox[][]>([]);
  const [boardRect, setBoardRect] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Live word being formed during drag
  const liveWord = isDragging && selection.length > 0 && grid
    ? selection.map(s => grid[s.row][s.col].letter).join('')
    : '';

  // Measure all cell positions relative to the board container
  const measureCells = useCallback(() => {
    if (!boardRef.current) return;
    const boardEl = boardRef.current;
    const boardBounds = boardEl.getBoundingClientRect();
    setBoardRect({ w: boardBounds.width, h: boardBounds.height });
    const cells = boardEl.querySelectorAll<HTMLElement>('[data-cell]');
    const boxes: CellBox[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ x: 0, y: 0, cx: 0, cy: 0, w: 0, h: 0 }))
    );
    cells.forEach(el => {
      const r = parseInt(el.dataset.row ?? '', 10);
      const c = parseInt(el.dataset.col ?? '', 10);
      if (Number.isNaN(r) || Number.isNaN(c)) return;
      const b = el.getBoundingClientRect();
      boxes[r][c] = {
        x: b.left - boardBounds.left,
        y: b.top - boardBounds.top,
        cx: b.left - boardBounds.left + b.width / 2,
        cy: b.top - boardBounds.top + b.height / 2,
        w: b.width,
        h: b.height,
      };
    });
    setCellBoxes(boxes);
  }, [rows, cols]);

  useLayoutEffect(() => {
    measureCells();
    const ro = new ResizeObserver(() => measureCells());
    if (boardRef.current) ro.observe(boardRef.current);
    window.addEventListener('resize', measureCells);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureCells);
    };
  }, [measureCells, grid]);

  const getCellFromPoint = useCallback((x: number, y: number): { row: number; col: number } | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    const cellEl = el.closest('[data-cell]') as HTMLElement | null;
    if (!cellEl) return null;
    const row = parseInt(cellEl.dataset.row ?? '', 10);
    const col = parseInt(cellEl.dataset.col ?? '', 10);
    if (Number.isNaN(row) || Number.isNaN(col)) return null;
    return { row, col };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, row: number, col: number) => {
    e.preventDefault();
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    startDrag({ row, col });
  }, [startDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (cell) addToSelection(cell);
  }, [isDragging, addToSelection, getCellFromPoint]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    endDrag();
  }, [isDragging, endDrag]);

  const handlePointerCancel = useCallback(() => {
    if (isDragging) cancelDrag();
  }, [isDragging, cancelDrag]);

  if (!grid) return null;

  // SVG path for the current drag selection
  const selectionPath =
    selection.length > 0 && cellBoxes.length > 0
      ? selection
          .map(s => cellBoxes[s.row]?.[s.col])
          .filter(Boolean)
          .map((b, i) => `${i === 0 ? 'M' : 'L'} ${b.cx} ${b.cy}`)
          .join(' ')
      : '';

  // Cell size based on grid dimensions — mobile first, circles need more room
  const cellSizeClass =
    cols <= 6
      ? 'w-11 h-11 sm:w-13 sm:h-13 text-lg'
      : 'w-10 h-10 sm:w-12 sm:h-12 text-base';

  // Determine if current selection is a partial match (Wordle orange hint)
  const showPartialHint = isDragging && partialCells.length === 0 && selection.length >= 2;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Live word display above grid */}
      <div className="flex h-9 items-center justify-center">
        {liveWord && (
          <motion.div
            key={liveWord}
            initial={{ opacity: 0, y: -6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="rounded-full bg-white/[0.06] px-4 py-1.5 ring-1 ring-white/10 backdrop-blur-sm"
          >
            <span className="font-mono text-lg font-bold uppercase tracking-[0.15em] text-neutral-50">
              {liveWord}
            </span>
          </motion.div>
        )}
      </div>

      <div
        ref={boardRef}
        className="no-select touch-none relative inline-flex flex-col gap-2.5 rounded-3xl bg-white/[0.015] p-3 ring-1 ring-white/[0.04] backdrop-blur-sm sm:gap-3 sm:p-4"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        style={{ touchAction: 'none' }}
      >
        {/* SVG overlay for the drag path */}
        {cellBoxes.length > 0 && selection.length > 1 && (
          <svg
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            width={boardRect.w}
            height={boardRect.h}
            viewBox={`0 0 ${boardRect.w} ${boardRect.h}`}
            fill="none"
          >
            <motion.path
              d={selectionPath}
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth={Math.min(...(cellBoxes[0]?.[0] ? [cellBoxes[0][0].w * 0.5] : [20]))}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.15))' }}
            />
          </svg>
        )}

        {/* The grid */}
        <div className="relative z-10">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-2.5 sm:gap-3" style={{ marginBottom: r < rows - 1 ? undefined : 0 }}>
              {Array.from({ length: cols }).map((__, c) => {
                const cell = grid[r][c];
                const isSelected = selection.some(s => s.row === r && s.col === c);
                const isError = errorCells.some(s => s.row === r && s.col === c);
                const isPartial = partialCells.some(s => s.row === r && s.col === c);
                const isLastFound = lastFoundCells.some(s => s.row === r && s.col === c);
                const isSpangramCell = cell.state === 'spangram';
                const isFoundCell = cell.state === 'found';
                const isHinted = cell.hinted;

                // Color for found cells — Wordle green for theme words, gold for spangram
                const foundColor =
                  cell.colorIndex === -2
                    ? SPANGRAM_COLOR
                    : cell.colorIndex >= 0
                      ? WORD_COLORS[cell.colorIndex % WORD_COLORS.length]
                      : null;

                // Use the iconic Wordle green for all theme-word found cells
                const displayColor =
                  isSpangramCell && foundColor
                    ? foundColor // gold for spangram
                    : isFoundCell && foundColor
                      ? '#6aaa64' // Wordle green for theme words
                      : null;

                return (
                  <motion.div
                    key={`${r}-${c}`}
                    data-cell
                    data-row={r}
                    data-col={c}
                    onPointerDown={(e) => handlePointerDown(e, r, c)}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                    className={cn(
                      'flex select-none items-center justify-center rounded-full font-bold uppercase tracking-tight',
                      'cursor-pointer touch-none',
                      cellSizeClass,
                    )}
                    animate={{
                      scale: isSelected && !isFoundCell && !isSpangramCell ? 1.08 : 1,
                    }}
                    style={{
                      // Background colors — Wordle palette
                      backgroundColor: isError
                        ? '#ef4444'  // red for error
                        : isPartial
                          ? '#c9b458'  // Wordle yellow/orange for partial
                          : isSelected && !isFoundCell && !isSpangramCell
                            ? 'rgba(255, 255, 255, 0.85)'
                            : displayColor ?? 'rgba(255, 255, 255, 0.04)',
                      color: isError || isPartial || isSelected || isFoundCell || isSpangramCell
                        ? '#0a0a0a'
                        : '#f5f5f7',
                      // Subtle shadow — chill Wordle style
                      boxShadow: isSpangramCell
                        ? '0 2px 12px rgba(244, 208, 63, 0.25)'
                        : isFoundCell
                          ? '0 2px 8px rgba(106, 170, 100, 0.25)'
                          : isSelected
                            ? '0 2px 10px rgba(255, 255, 255, 0.15)'
                            : 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                      border: isHinted
                        ? '2px solid rgba(244, 208, 63, 0.7)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
                    }}
                  >
                    <motion.span
                      key={`${cell.letter}-${isFoundCell}-${isSpangramCell}`}
                      initial={false}
                      animate={{
                        scale: isLastFound ? [1, 1.18, 1] : 1,
                      }}
                      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                      className={cn(
                        'relative',
                        isSpangramCell && 'animate-spangram-glow',
                        isHinted && 'animate-hint-pulse rounded-full',
                      )}
                    >
                      {cell.letter}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
