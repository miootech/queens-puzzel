'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Home, RotateCcw, Lightbulb, Volume2, VolumeX, X, Star } from 'lucide-react';
import { useGameStore } from '@/lib/game/gameStore';
import { DIFFICULTY_CONFIG } from '@/lib/game/types';
import { formatTime } from '@/lib/game/stats';
import { cn } from '@/lib/utils';

// Top compact header
export function GameHUD() {
  const difficulty = useGameStore(s => s.difficulty);
  const theme = useGameStore(s => s.theme);
  const foundSpangram = useGameStore(s => s.foundSpangram);
  const goToMenu = useGameStore(s => s.goToMenu);
  const restart = useGameStore(s => s.restart);
  const muted = useGameStore(s => s.muted);
  const toggleMute = useGameStore(s => s.toggleMute);

  if (!difficulty) return null;
  const cfg = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <motion.button
          onClick={goToMenu}
          whileTap={{ scale: 0.92 }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08] hover:text-white"
          aria-label="Hauptmenü"
        >
          <Home className="h-[16px] w-[16px]" />
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-neutral-500">
            {cfg.label}
          </span>
          <span
            className="text-[16px] font-semibold tracking-tight text-neutral-50"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {theme}
          </span>
        </div>

        <div className="flex gap-1.5">
          <motion.button
            onClick={toggleMute}
            whileTap={{ scale: 0.92 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08] hover:text-white"
            aria-label={muted ? 'Ton an' : 'Ton aus'}
          >
            {muted ? <VolumeX className="h-[16px] w-[16px]" /> : <Volume2 className="h-[16px] w-[16px]" />}
          </motion.button>
          <motion.button
            onClick={restart}
            whileTap={{ scale: 0.92 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08] hover:text-white"
            aria-label="Neu starten"
          >
            <RotateCcw className="h-[16px] w-[16px]" />
          </motion.button>
        </div>
      </div>

      {foundSpangram && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-1.5"
        >
          <Star className="h-3 w-3 fill-[var(--word-gold)] text-[var(--word-gold)]" />
          <span className="text-[10px] font-medium text-[var(--word-gold)]">Spangram gefunden</span>
        </motion.div>
      )}
    </div>
  );
}

// Bottom HUD — subtle timer + 70-30 stat cards
export function GameHUDBottom() {
  const difficulty = useGameStore(s => s.difficulty);
  const errors = useGameStore(s => s.errors);
  const maxErrors = useGameStore(s => s.maxErrors);
  const foundWords = useGameStore(s => s.foundWords);
  const foundSpangram = useGameStore(s => s.foundSpangram);
  const placedWords = useGameStore(s => s.placedWords);
  const timeSeconds = useGameStore(s => s.timeSeconds);
  const timeLimit = useGameStore(s => s.timeLimit);
  const isRunning = useGameStore(s => s.isRunning);
  const tick = useGameStore(s => s.tick);
  const hintAvailable = useGameStore(s => s.hintAvailable);
  const useHint = useGameStore(s => s.useHint);

  const lastTimeRef = useRef(timeSeconds);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // Trigger a re-render when timeSeconds changes (the ref doesn't trigger renders)
  // The store update already triggers a re-render via the timeSeconds selector.
  void lastTimeRef;

  if (!difficulty) return null;

  const foundCount = foundWords.length + (foundSpangram ? 1 : 0);
  const totalCount = placedWords.length;

  const showCountdown = timeLimit !== null;
  const remaining = showCountdown ? Math.max(0, (timeLimit ?? 0) - timeSeconds) : timeSeconds;
  const timeStr = formatTime(remaining);
  const isLowTime = showCountdown && remaining <= 15;

  // Error dots
  const errorDots = Array.from({ length: maxErrors }).map((_, i) => i < errors);

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Subtle timer row + hint button */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex w-10 justify-end">
          {hintAvailable && (
            <motion.button
              onClick={useHint}
              whileTap={{ scale: 0.9 }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--word-gold)]/15 text-[var(--word-gold)] ring-1 ring-[var(--word-gold)]/30"
              aria-label="Hinweis"
            >
              <Lightbulb className="h-[16px] w-[16px]" />
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Clock className={cn('h-[15px] w-[15px] transition-colors', isLowTime ? 'text-red-400' : 'text-neutral-600')} />
          <span
            className={cn(
              'font-mono text-[15px] font-medium tabular-nums tracking-wide transition-colors',
              isLowTime ? 'text-red-400' : 'text-neutral-400',
            )}
          >
            {timeStr}
          </span>
        </div>

        <div className="flex w-10 justify-start" />
      </div>

      {/* 70-30 stat cards: Found words (70%) | Errors (30%) */}
      <div className="flex items-stretch gap-2">
        {/* Found words card (70%) */}
        <div className="flex flex-[7] flex-col gap-2 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              Wörter
            </span>
            <span className="font-mono text-sm font-semibold text-neutral-100">
              {foundCount}<span className="text-neutral-600"> / {totalCount}</span>
            </span>
          </div>
          <div className="flex gap-1">
            {placedWords.map((pw, i) => {
              const isFound = !pw.isSpangram && foundWords.includes(pw.word);
              const isSpangramFound = pw.isSpangram && foundSpangram;
              const isFoundAny = isFound || isSpangramFound;
              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    scale: isFoundAny ? 1 : 0.85,
                    opacity: isFoundAny ? 1 : 0.4,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="h-1.5 flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor: isSpangramFound
                      ? 'var(--word-gold)'
                      : isFound
                        ? '#6aaa64'
                        : 'rgba(255, 255, 255, 0.08)',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Errors card (30%) */}
        <div className="flex flex-[3] flex-col gap-2 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              Fehler
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {errorDots.map((used, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: used ? 1 : 0.85,
                  backgroundColor: used ? '#ef4444' : 'rgba(255, 255, 255, 0.06)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex h-5 w-5 items-center justify-center rounded-md"
              >
                {used && <X className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
