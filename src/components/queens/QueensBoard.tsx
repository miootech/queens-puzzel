'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { useQueensStore } from '@/lib/queens/queensStore';
import { REGION_COLORS, REGION_COLORS_FEMBOY, SHOP_ITEMS } from '@/lib/queens/types';
import shopData from '@/lib/queens/shop-items.json';
import { cn } from '@/lib/utils';

// Lookup für Queen-Skins aus shop-items.json (image path)
interface QueenItem { id: string; image?: string }
const QUEEN_LOOKUP: Record<string, QueenItem> = (shopData.queens as QueenItem[]).reduce(
  (acc, q) => { acc[q.id] = q; return acc; },
  {} as Record<string, QueenItem>
);

// ── Luminanz berechnen: gibt 'weiß' oder 'schwarz' zurück je nach Hintergrund-Helligkeit ──
// Wenn Hintergrund dunkel ist (z.B. Kohle-Schwarz #1A1A1A), wird Queen/X hell (weiß)
// Wenn Hintergrund hell ist (z.B. Yellow #FFD700), wird Queen/X dunkel (schwarz)
function getContrastColor(hexColor: string): string {
  // Hex in RGB umwandeln
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#000000';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Relative Luminanz (W3C-Standard)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Wenn Luminanz < 0.5, Hintergrund ist dunkel → weißes Icon
  // Sonst → schwarzes Icon
  return luminance < 0.5 ? '#FFFFFF' : '#000000';
}

// ── Queen Marker (Bild mit Crown-Fallback) ──
// Bild wird als zentrierter Circle innerhalb der Zelle angezeigt (nicht full-bleed)
// Aktuell: bg übergeben, um Icon-Farbe an Hintergrund-Helligkeit anzupassen (dark-on-light, light-on-dark)
function QueenMarker({ activeQueen, bgColor }: { activeQueen: string; bgColor: string }) {
  const queen = QUEEN_LOOKUP[activeQueen];
  const [imgError, setImgError] = useState(false);
  const iconColor = getContrastColor(bgColor);

  // Reset error state when queen changes
  useEffect(() => { setImgError(false); }, [activeQueen]);

  // Fallback: klassische Krone, ca. 55% der Zelle, Farbe an Hintergrund angepasst
  if (!queen?.image || imgError) {
    return (
      <Crown className="h-[55%] w-[55%]" fill={iconColor} stroke={iconColor} strokeWidth={1.4} />
    );
  }

  // Bild in zentriertem Kreis: 70% der Zellgröße, rounded-full, object-cover
  return (
    <div
      className="flex h-[70%] w-[70%] items-center justify-center overflow-hidden rounded-full ring-2 ring-black/20"
      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
    >
      <img
        src={queen.image}
        alt={activeQueen}
        className="h-full w-full object-cover"
        onError={() => setImgError(true)}
        draggable={false}
      />
    </div>
  );
}

export function QueensBoard() {
  const cells = useQueensStore(s => s.cells);
  const size = useQueensStore(s => s.size);
  const cycleCell = useQueensStore(s => s.cycleCell);
  const setCellState = useQueensStore(s => s.setCellState);
  const activeTheme = useQueensStore(s => s.activeTheme);
  const activeFemboyTheme = useQueensStore(s => s.activeFemboyTheme);
  const activeQueen = useQueensStore(s => s.activeQueen);
  const difficulty = useQueensStore(s => s.difficulty);

  // Bundle-Override: falls ein Bundle aktiv ist, verwende dessen Grid-Farben
  const activeBundle = useQueensStore(s => s.activeBundle);
  const bundleData = activeBundle ? shopData.bundles?.find((b: any) => b.id === activeBundle) : null;
  const bundleColors = bundleData?.gridColors as string[] | undefined;

  // Femboy-Modus: verwende das aktive Femboy-Theme aus dem Shop (theme-femboy-default ist Hellfire)
  // Andere Modi: Theme-Farben falls aktiv, sonst REGION_COLORS (Pastell)
  // Bundle hat höchste Priorität (überschreibt alles)
  const isFemboy = difficulty === 'femboy';
  const femboyThemeData = isFemboy
    ? shopData.themes.find(t => t.id === activeFemboyTheme)
    : null;
  const activeColors = bundleColors ?? (isFemboy
    ? (femboyThemeData?.colors ?? REGION_COLORS_FEMBOY)
    : (SHOP_ITEMS.find(i => i.id === activeTheme)?.colors ?? REGION_COLORS));

  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartedRef = useRef(false);

  // Keyboard handler
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

  // Get cell from pointer position
  const getCellFromPoint = useCallback((x: number, y: number): { r: number; c: number } | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    const cellEl = el.closest('[data-cell]') as HTMLElement | null;
    if (!cellEl) return null;
    const r = parseInt(cellEl.dataset.row ?? '', 10);
    const c = parseInt(cellEl.dataset.col ?? '', 10);
    if (Number.isNaN(r) || Number.isNaN(c)) return null;
    return { r, c };
  }, []);

  // Pointer down — start drag
  const handlePointerDown = useCallback((e: React.PointerEvent, r: number, c: number) => {
    // Start drag mode (don't preventDefault — onClick needs to fire)
    setIsDragging(true);
    dragStartedRef.current = false;
  }, []);

  // Pointer move — if dragging, mark cells with X
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    dragStartedRef.current = true;
    // Set X on dragged cells (only if currently empty and no hint)
    if (cells && cells[cell.r][cell.c].state === 'empty' && !cells[cell.r][cell.c].hintExclude) {
      setCellState(cell.r, cell.c, 'x');
    }
  }, [isDragging, getCellFromPoint, cells, setCellState]);

  // Global pointer listeners for drag continuation outside the cell
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: PointerEvent) => {
      const cell = getCellFromPoint(e.clientX, e.clientY);
      if (!cell) return;
      dragStartedRef.current = true;
      if (cells && cells[cell.r][cell.c].state === 'empty' && !cells[cell.r][cell.c].hintExclude) {
        setCellState(cell.r, cell.c, 'x');
      }
    };
    const handleUp = () => {
      setIsDragging(false);
      dragStartedRef.current = false;
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [isDragging, getCellFromPoint, cells, setCellState]);

  if (!cells) return null;

  const cellSizeClass = size <= 6 ? 'w-[14vw] h-[14vw] max-w-[58px] max-h-[58px] sm:w-[56px] sm:h-[56px] text-2xl'
    : size <= 8 ? 'w-[10.5vw] h-[10.5vw] max-w-[42px] max-h-[42px] sm:w-[42px] sm:h-[42px] text-lg'
    : size <= 12 ? 'w-[7.5vw] h-[7.5vw] max-w-[30px] max-h-[30px] sm:w-[30px] sm:h-[30px] text-sm'
    : 'w-[6vw] h-[6vw] max-w-[24px] max-h-[24px] sm:w-[24px] sm:h-[24px] text-xs'; // 15×15 Femboy-Modus

  const borderFor = (r: number, c: number): React.CSSProperties => {
    const cell = cells[r][c]; const rid = cell.regionId;
    const top = r > 0 ? cells[r - 1][c].regionId !== rid : true;
    const bottom = r < size - 1 ? cells[r + 1][c].regionId !== rid : true;
    const left = c > 0 ? cells[r][c - 1].regionId !== rid : true;
    const right = c < size - 1 ? cells[r][c + 1].regionId !== rid : true;
    // Femboy-Modus (15x15): 2px Borders mit schwarz/90% für klare Sichtbarkeit
    // (vorher 1.5px was zu dünn und verschwand bei vibranten Farben)
    const borderWidth = difficulty === 'femboy' ? 2 : 3;
    return {
      borderTopWidth: top ? borderWidth : 0.5,
      borderBottomWidth: bottom ? borderWidth : 0.5,
      borderLeftWidth: left ? borderWidth : 0.5,
      borderRightWidth: right ? borderWidth : 0.5,
      borderColor: 'rgba(0, 0, 0, 0.9)',
      borderStyle: 'solid',
    };
  };

  return (
    <div className="inline-flex flex-col rounded-2xl bg-white/[0.02] p-1.5 ring-1 ring-white/[0.06] backdrop-blur-sm" style={{ touchAction: 'none' }}>
      {Array.from({ length: size }).map((_, r) => (
        <div key={r} className="flex">
          {Array.from({ length: size }).map((__, c) => {
            const cell = cells[r][c];
            const color = activeColors[cell.regionId % activeColors.length];
            const isCrown = cell.state === 'crown';
            const isX = cell.state === 'x';
            const isError = cell.hasError;
            const isHintExclude = cell.hintExclude;
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;
            return (
              <motion.button
                key={`${r}-${c}`}
                data-cell
                data-row={r}
                data-col={c}
                onPointerDown={(e) => handlePointerDown(e, r, c)}
                onPointerMove={handlePointerMove}
                onClick={() => {
                  // Only handle click if no drag happened
                  if (!dragStartedRef.current) {
                    if (cell.hintExclude) { cycleCell(r, c); setSelectedCell({ r, c }); return; }
                    // Simple state-based: empty → X → Krone → empty
                    if (cell.state === 'empty') setCellState(r, c, 'x');
                    else if (cell.state === 'x') setCellState(r, c, 'crown');
                    else setCellState(r, c, 'empty');
                    setSelectedCell({ r, c });
                  }
                  dragStartedRef.current = false;
                }}
                onPointerEnter={() => setHoveredCell({ r, c })}
                onPointerLeave={() => setHoveredCell(null)}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 600, damping: 22 }}
                className={cn('relative flex select-none items-center justify-center font-bold transition-colors', cellSizeClass)}
                style={{ backgroundColor: color, borderColor: 'rgba(0, 0, 0, 0.85)', touchAction: 'none', ...borderFor(r, c) }}
              >
                {isSelected && <span className="pointer-events-none absolute inset-0.5 rounded-md ring-2 ring-white" style={{ boxShadow: '0 0 12px 2px rgba(255, 255, 255, 0.4)' }} />}
                {isHovered && !isSelected && <span className="pointer-events-none absolute inset-1 rounded-md ring-1 ring-white/40" />}
                <AnimatePresence mode="wait">
                  {isCrown && (
                    <motion.span key="crown" initial={{ scale: 0, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <QueenMarker activeQueen={activeQueen} bgColor={color} />
                    </motion.span>
                  )}
                  {isX && !isCrown && (
                    <motion.span key="x" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.55 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 22 }} className="absolute inset-0 flex items-center justify-center">
                      <X className="h-1/2 w-1/2" strokeWidth={3} style={{ color: getContrastColor(color), opacity: 0.7 }} />
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {isHintExclude && !isCrown && (
                    <motion.span key={`hint-${r}-${c}`} initial={{ scale: 0, opacity: 0, rotate: -45 }} animate={{ scale: 1, opacity: 0.6, rotate: 0 }} exit={{ scale: 0, opacity: 0, rotate: 45 }} transition={{ type: 'spring', stiffness: 500, damping: 18, delay: (r + c) * 0.04 }} className="absolute inset-0 flex items-center justify-center">
                      <X className="h-[45%] w-[45%]" strokeWidth={2.5} style={{ color: getContrastColor(color), opacity: 0.6 }} />
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
            <span className="flex items-center gap-1"><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-neutral-300">1</kbd>Empty</span>
            <span className="flex items-center gap-1"><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-neutral-300">2</kbd>X</span>
            <span className="flex items-center gap-1"><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-neutral-300">3</kbd>Crown</span>
            <span className="text-neutral-600">· Click: X → Crown · Drag: X</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
