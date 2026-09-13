'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { useQueensStore } from '@/lib/queens/queensStore';
import { REGION_COLORS } from '@/lib/queens/types';
import { cn } from '@/lib/utils';

export function QueensBoard() {
  const cells = useQueensStore(s => s.cells);
  const size = useQueensStore(s => s.size);
  const cycleCell = useQueensStore(s => s.cycleCell);
  const setCellState = useQueensStore(s => s.setCellState);

  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const key = e.key.toLowerCase();
      let newState: 'empty' | 'x' | 'crown' | null = null;
      if (key === '1' || key === 'e' || key === 'backspace' || key === 'delete') newState = 'empty';
      else if (key === '2' || key === 'x') newState = 'x';
      else if (key === '3' || key === 'c') newState = 'crown';
      if (newState) { e.preventDefault(); setCellState(selectedCell.r, selectedCell.c, newState); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedCell, setCellState]);

  if (!cells) return null;

  const cellSizeClass = size <= 6 ? 'w-[14vw] h-[14vw] max-w-[58px] max-h-[58px] sm:w-[56px] sm:h-[56px] text-2xl'
    : size <= 8 ? 'w-[10.5vw] h-[10.5vw] max-w-[42px] max-h-[42px] sm:w-[42px] sm:h-[42px] text-lg'
    : 'w-[7.5vw] h-[7.5vw] max-w-[30px] max-h-[30px] sm:w-[30px] sm:h-[30px] text-sm';

  const borderFor = (r: number, c: number): React.CSSProperties => {
    const cell = cells[r][c]; const rid = cell.regionId;
    const top = r > 0 ? cells[r - 1][c].regionId !== rid : true;
    const bottom = r < size - 1 ? cells[r + 1][c].regionId !== rid : true;
    const left = c > 0 ? cells[r][c - 1].regionId !== rid : true;
    const right = c < size - 1 ? cells[r][c + 1].regionId !== rid : true;
    return { borderTopWidth: top ? 3 : 0.5, borderBottomWidth: bottom ? 3 : 0.5, borderLeftWidth: left ? 3 : 0.5, borderRightWidth: right ? 3 : 0.5 };
  };

  return (
    <div className="inline-flex flex-col rounded-2xl bg-white/[0.02] p-1.5 ring-1 ring-white/[0.06] backdrop-blur-sm">
      {Array.from({ length: size }).map((_, r) => (
        <div key={r} className="flex">
          {Array.from({ length: size }).map((__, c) => {
            const cell = cells[r][c];
            const color = REGION_COLORS[cell.regionId % REGION_COLORS.length];
            const isCrown = cell.state === 'crown';
            const isX = cell.state === 'x';
            const isError = cell.hasError;
            const isHintExclude = cell.hintExclude;
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;
            return (
              <motion.button key={`${r}-${c}`}
                onClick={() => { cycleCell(r, c); setSelectedCell({ r, c }); }}
                onPointerEnter={() => setHoveredCell({ r, c })}
                onPointerLeave={() => setHoveredCell(null)}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 600, damping: 22 }}
                className={cn('relative flex select-none items-center justify-center font-bold transition-colors', cellSizeClass)}
                style={{ backgroundColor: color, borderColor: 'rgba(0, 0, 0, 0.85)', ...borderFor(r, c) }}
              >
                {isSelected && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none absolute inset-0.5 rounded-md ring-2 ring-white" style={{ boxShadow: '0 0 12px 2px rgba(255, 255, 255, 0.4)' }} />}
                {isHovered && !isSelected && <span className="pointer-events-none absolute inset-1 rounded-md ring-1 ring-white/40" />}
                <AnimatePresence mode="wait">
                  {isCrown && (
                    <motion.span key="crown" initial={{ scale: 0, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 16 }} className="absolute inset-0 flex items-center justify-center">
                      <Crown className="h-[55%] w-[55%] fill-neutral-900 text-neutral-900" strokeWidth={1.4} />
                    </motion.span>
                  )}
                  {isX && !isCrown && (
                    <motion.span key="x" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.55 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 450, damping: 20 }} className="absolute inset-0 flex items-center justify-center">
                      <X className="h-1/2 w-1/2 text-neutral-900/70" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {isHintExclude && !isCrown && (
                    <motion.span key={`hint-${r}-${c}`} initial={{ scale: 0, opacity: 0, rotate: -45 }} animate={{ scale: 1, opacity: 0.6, rotate: 0 }} exit={{ scale: 0, opacity: 0, rotate: 45 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: (r + c) * 0.04 }} className="absolute inset-0 flex items-center justify-center">
                      <X className="h-[45%] w-[45%] text-neutral-900/60" strokeWidth={2.5} />
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {isError && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 bg-red-500" />}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      ))}
      <AnimatePresence>
        {selectedCell && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-2 flex items-center justify-center gap-3 text-[10px] text-neutral-500">
            <span className="flex items-center gap-1"><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-neutral-300">1</kbd>Leer</span>
            <span className="flex items-center gap-1"><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-neutral-300">2</kbd>X</span>
            <span className="flex items-center gap-1"><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-neutral-300">3</kbd>Krone</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
