'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/game/gameStore';
import { DIFFICULTY_CONFIG } from '@/lib/game/types';
import { GameBoard } from './GameBoard';
import { GameHUD, GameHUDBottom } from './GameHUD';

export function PlayingScreen() {
  const difficulty = useGameStore(s => s.difficulty);
  const theme = useGameStore(s => s.theme);
  const foundWords = useGameStore(s => s.foundWords);
  const foundSpangram = useGameStore(s => s.foundSpangram);
  const isGameOver = useGameStore(s => s.isGameOver);

  if (!difficulty) return null;
  const cfg = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="bg-mesh flex min-h-screen w-full flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full max-w-md flex-col gap-3"
      >
        {/* Top compact header */}
        <GameHUD />

        {/* Grid in the center */}
        <div className="flex justify-center overflow-x-auto">
          <GameBoard rows={cfg.rows} cols={cfg.cols} />
        </div>

        {/* Bottom HUD: timer + progress + errors */}
        <GameHUDBottom />

        {/* Found words list (subtle, only shown if any found) */}
        {(foundWords.length > 0 || foundSpangram) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5"
          >
            <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              Gefundene Wörter
            </div>
            <div className="flex flex-wrap gap-1.5">
              {foundWords.map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="rounded-md bg-[var(--word-blue)]/20 px-2 py-1 text-xs font-semibold text-[var(--word-blue)]"
                >
                  {w}
                </motion.span>
              ))}
              {foundSpangram && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="rounded-md bg-[var(--word-gold)]/20 px-2 py-1 text-xs font-semibold text-[var(--word-gold)]"
                >
                  ★ Spangram
                </motion.span>
              )}
            </div>
          </motion.div>
        )}

        {/* Theme hint at bottom */}
        <p className="text-center text-[11px] text-neutral-600">
          Alle Wörter gehören zum Thema <span className="text-neutral-400">„{theme}"</span>
        </p>
      </motion.div>

      {isGameOver && null}
    </div>
  );
}
