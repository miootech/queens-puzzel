'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Play, Clock, Trophy } from 'lucide-react';
import { useGameStore } from '@/lib/game/gameStore';
import { StatsModal } from './StatsModal';
import { initAudio } from '@/lib/game/sound';
import {
  formatTime,
  getOverallBestTime,
  getBestDifficulty,
  difficultyLabel,
} from '@/lib/game/stats';

export function MainMenu() {
  const goToDifficulty = useGameStore(s => s.goToDifficulty);
  const stats = useGameStore(s => s.stats);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const handler = () => initAudio();
    window.addEventListener('pointerdown', handler, { once: true });
    return () => window.removeEventListener('pointerdown', handler);
  }, []);

  const overallBest = getOverallBestTime(stats);
  const bestDiff = getBestDifficulty(stats);
  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  return (
    <div className="bg-mesh relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-10">
      {/* Stats icon top-right — refined */}
      <motion.button
        onClick={() => setShowStats(true)}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileTap={{ scale: 0.92 }}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.08] backdrop-blur-xl transition-colors hover:bg-white/[0.08] hover:text-white"
        aria-label="Statistiken"
      >
        <BarChart3 className="h-[18px] w-[18px]" />
      </motion.button>

      <div className="flex max-w-md flex-col items-center gap-12">
        {/* Hero title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="flex items-center gap-2 rounded-full bg-white/[0.03] px-3.5 py-1.5 ring-1 ring-white/[0.06]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--word-gold)] shadow-[0_0_8px_var(--word-gold)]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">
              Wortsuch-Puzzle
            </span>
          </motion.div>

          <h1
            className="text-[68px] font-bold leading-none tracking-tight text-neutral-50 sm:text-[80px]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.03em' }}
          >
            Strands
          </h1>

          <p className="max-w-sm text-[14px] font-light leading-relaxed text-neutral-400">
            Finde alle Themenwörter und das goldene Spangram.
            Verbinde benachbarte Buchstaben durch Ziehen — horizontal,
            vertikal oder diagonal.
          </p>
        </motion.div>

        {/* Start button — elegant pill */}
        <motion.button
          onClick={goToDifficulty}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="group flex items-center gap-3 rounded-full bg-neutral-50 px-12 py-5 text-[15px] font-medium tracking-wide text-neutral-950 shadow-[0_8px_30px_rgba(255,255,255,0.12)] transition-shadow hover:shadow-[0_12px_40px_rgba(255,255,255,0.18)]"
        >
          <Play className="h-[14px] w-[14px] fill-neutral-950" />
          Spiel starten
        </motion.button>

        {/* Stats teaser — refined 3-column layout */}
        {stats.gamesPlayed > 0 && (
          <motion.button
            onClick={() => setShowStats(true)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full max-w-sm items-stretch gap-0 overflow-hidden rounded-2xl bg-white/[0.025] ring-1 ring-white/[0.06] backdrop-blur-xl transition-colors hover:bg-white/[0.04]"
          >
            {/* Games played */}
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-4 py-4">
              <span className="font-mono text-2xl font-semibold tabular-nums text-neutral-50">
                {stats.gamesPlayed}
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Spiele
              </span>
            </div>

            {/* Divider */}
            <div className="my-3 w-px bg-white/[0.06]" />

            {/* Win rate */}
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-4 py-4">
              <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--word-gold)]">
                {winRate}<span className="text-base">%</span>
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Siegrate
              </span>
            </div>

            {/* Divider */}
            <div className="my-3 w-px bg-white/[0.06]" />

            {/* Best time */}
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-4 py-4">
              <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--word-blue)]">
                {overallBest !== null ? formatTime(overallBest) : '—'}
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                {bestDiff ? `Best · ${difficultyLabel(bestDiff)}` : 'Bestzeit'}
              </span>
            </div>
          </motion.button>
        )}
      </div>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </div>
  );
}
