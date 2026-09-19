'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Clock, RotateCcw, Undo2, Lightbulb, BarChart3,
  X, Trophy, Star, Heart, Instagram, Globe, ShoppingBag, Flame,
} from 'lucide-react';
import { useQueensStore } from '@/lib/queens/queensStore';
import { MAX_HINTS, MAX_ERRORS, DIFFICULTY_CONFIG, Difficulty, getDifficultyLimits } from '@/lib/queens/types';
import { QueensBoard } from '@/components/queens/QueensBoard';
import { BottleIcon } from "@/components/queens/BottleIcon";
import { ShopModal } from '@/components/queens/ShopModal';
import { GambleModal } from '@/components/queens/GambleModal';
import { StatsModal } from '@/components/queens/StatsModal';
import { cn } from '@/lib/utils';
import shopData from '@/lib/queens/shop-items.json';

function formatTime(s: number) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }

export default function QueensPage() {
  const cells = useQueensStore(s => s.cells);
  const size = useQueensStore(s => s.size);
  const difficulty = useQueensStore(s => s.difficulty);
  const timeSeconds = useQueensStore(s => s.timeSeconds);
  const isRunning = useQueensStore(s => s.isRunning);
  const hintsUsed = useQueensStore(s => s.hintsUsed);
  const errorCount = useQueensStore(s => s.errorCount);
  const splitRegionCount = useQueensStore(s => s.splitRegionCount);
  const historyLen = useQueensStore(s => s.history.length);
  const showResult = useQueensStore(s => s.showResult);
  const lastResult = useQueensStore(s => s.lastResult);
  const stats = useQueensStore(s => s.stats);
  const showStats = useQueensStore(s => s.showStats);
  const showShop = useQueensStore(s => s.showShop);
  const levels = useQueensStore(s => s.levels);
  const coins = useQueensStore(s => s.coins);
  const lastPfandflaschenEarned = useQueensStore(s => s.lastPfandflaschenEarned);
  const pfandflaschenBreakdown = useQueensStore(s => s.pfandflaschenBreakdown);
  const showGamble = useQueensStore(s => s.showGamble);
  const gambled = useQueensStore(s => s.gambled);
  const gambleMultiplier = useQueensStore(s => s.gambleMultiplier);
  const startGamble = useQueensStore(s => s.startGamble);
  const tick = useQueensStore(s => s.tick);
  const startNewGame = useQueensStore(s => s.startNewGame);
  const setDifficulty = useQueensStore(s => s.setDifficulty);
  const undo = useQueensStore(s => s.undo);
  const reset = useQueensStore(s => s.reset);
  const useHint = useQueensStore(s => s.useHint);
  const toggleStats = useQueensStore(s => s.toggleStats);
  const toggleShop = useQueensStore(s => s.toggleShop);
  const dismissResult = useQueensStore(s => s.dismissResult);

  const init = useRef(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!init.current) { init.current = true; startNewGame(); } }, [startNewGame]);
  useEffect(() => { if (!isRunning) return; const i = setInterval(() => tick(), 1000); return () => clearInterval(i); }, [isRunning, tick]);

  // Difficulty-spezifische Hint-Limits
  const currentMaxHints = getDifficultyLimits(difficulty).maxHints;
  const currentMaxErrors = getDifficultyLimits(difficulty).maxErrors;
  const hintsLeft = currentMaxHints - hintsUsed;
  const canUndo = historyLen > 1;
  const currentLevel = levels[difficulty] ?? 1;
  const currentStreak = useQueensStore(s => s.streaks[difficulty] ?? 0);

  const activeBundle = useQueensStore(s => s.activeBundle);

  const handleNext = () => { dismissResult(); startNewGame(); };

  // Bundle BG Override + Custom Currency + Logo Easter Egg
  const bundleData = activeBundle ? (shopData as any).bundles?.find((b: any) => b.id === activeBundle) : null;
  const bundleBgStyle: React.CSSProperties = bundleData?.background ? {
    backgroundImage: `url(${bundleData.background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    backgroundColor: '#000',
  } : {};

  // Custom Currency: wenn Bundle aktiv, zeige dessen Currency Name + Icon
  const currencyName = bundleData?.currencyName ?? 'Pfandflaschen';
  const currencyIcon = bundleData?.currencyIcon;
  const bundleLogo = bundleData?.logo;

  return (
    <div
      className={cn('relative flex min-h-screen w-full flex-col items-center px-4 py-5', !bundleData && 'bg-mesh', !bundleData && difficulty === 'femboy' && 'femboy-bg')}
      style={bundleData ? bundleBgStyle : undefined}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex w-full max-w-md items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Logo: Bundle Easter Egg oder default Crown */}
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-white/10 overflow-hidden', !bundleLogo && (difficulty === 'femboy' ? 'bg-gradient-to-br from-pink-500/40 to-rose-500/40' : 'bg-gradient-to-br from-amber-500/30 to-rose-500/30'))}>
            {bundleLogo ? (
              <img src={bundleLogo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Crown className={cn('h-4 w-4', difficulty === 'femboy' ? 'fill-pink-200 text-pink-200' : 'fill-amber-300 text-amber-300')} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-neutral-500">Logic Puzzle</span>
            <span className="text-[16px] font-semibold leading-none tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Queens</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Currency Badge: Bundle Currency oder default Pfandflaschen */}
          <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 ring-1', difficulty === 'femboy' && !bundleData ? 'bg-pink-500/[0.08] ring-pink-500/20' : bundleData ? 'bg-amber-500/[0.08] ring-amber-500/20' : 'bg-amber-500/[0.08] ring-amber-500/20')}>
            {currencyIcon ? (
              <img src={currencyIcon} alt={currencyName} className="h-4 w-4 object-contain" />
            ) : (
              <BottleIcon className={cn('h-3.5 w-3.5', difficulty === 'femboy' ? 'text-pink-300' : 'text-amber-400')} />
            )}
            <span className={cn('font-mono text-[13px] font-bold tabular-nums', difficulty === 'femboy' && !bundleData ? 'text-pink-200' : 'text-amber-300')}>{mounted ? coins : 0}</span>
          </div>
          <motion.button onClick={toggleShop} whileTap={{ scale: 0.92 }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-white" aria-label="Shop"><ShoppingBag className="h-[16px] w-[16px]" /></motion.button>
          <motion.button onClick={toggleStats} whileTap={{ scale: 0.92 }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-white" aria-label="Stats"><BarChart3 className="h-[16px] w-[16px]" /></motion.button>
        </div>
      </motion.div>

      {/* Level Pill + Streak */}
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mt-4 flex items-center gap-3">
        <motion.div animate={{ scale: currentLevel > 1 ? [1, 1.08, 1] : 1 }} transition={{ duration: 0.4, ease: 'easeInOut' }} className={cn(
          'flex items-center gap-2.5 rounded-full px-6 py-2.5 ring-1',
          difficulty === 'femboy'
            ? 'bg-gradient-to-r from-pink-500/[0.15] via-rose-500/[0.1] to-pink-500/[0.15] ring-pink-400/40'
            : 'bg-gradient-to-r from-[var(--word-gold)]/[0.12] via-[var(--word-gold)]/[0.08] to-[var(--word-gold)]/[0.12] ring-[var(--word-gold)]/25'
        )} style={{ boxShadow: difficulty === 'femboy' ? '0 4px 20px rgba(244, 114, 182, 0.15)' : '0 4px 20px rgba(244, 208, 63, 0.1)' }}>
          <Star className={cn('h-4 w-4', difficulty === 'femboy' ? 'fill-pink-400 text-pink-400' : 'fill-[var(--word-gold)] text-[var(--word-gold)]')} />
          <span className={cn('text-[11px] font-medium uppercase tracking-[0.18em]', difficulty === 'femboy' ? 'text-pink-200/70' : 'text-neutral-400')}>Level</span>
          <span className={cn('font-mono text-[20px] font-bold tabular-nums', difficulty === 'femboy' ? 'text-pink-300' : 'text-[var(--word-gold)]')} style={{ textShadow: difficulty === 'femboy' ? '0 0 12px rgba(244, 114, 182, 0.3)' : '0 0 12px rgba(244, 208, 63, 0.3)' }}>{mounted ? currentLevel : 1}</span>
        </motion.div>
        {mounted && currentStreak >= 2 && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 rounded-full bg-orange-500/[0.12] px-3 py-2.5 ring-1 ring-orange-500/25" style={{ boxShadow: '0 4px 16px rgba(249, 115, 22, 0.15)' }}>
            <Flame className="h-4 w-4 fill-orange-400 text-orange-400" />
            <span className="font-mono text-[16px] font-bold tabular-nums text-orange-400">{currentStreak}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Difficulty pills — Row 1: Easy, Normal, Extreme (3 Pills equal) */}
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-3 flex w-full max-w-md items-center justify-center gap-1.5 rounded-full bg-white/[0.03] p-1 ring-1 ring-white/[0.05]">
        {(['easy', 'normal', 'extreme'] as Difficulty[]).map(d => {
          const cfg = DIFFICULTY_CONFIG[d];
          const isActive = difficulty === d;
          return (
            <motion.button
              key={d}
              onClick={() => setDifficulty(d)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all',
                isActive
                  ? 'bg-white/[0.1] text-neutral-50 ring-1 ring-white/10'
                  : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              {cfg.label}
              <span className="text-[9px] opacity-60">{cfg.size}×{cfg.size}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Row 2: Femboy allein, zentriert, kürzer aber gleiche Dicke wie Row 1 */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-2 flex w-full max-w-md justify-center"
      >
        {/* Wrap in w-3/4 container for shorter width while keeping pill same style as Row 1 */}
        <div className="flex w-3/4 items-center justify-center gap-1.5 rounded-full bg-white/[0.03] p-1 ring-1 ring-white/[0.05]">
          <motion.button
            onClick={() => setDifficulty('femboy')}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all',
              difficulty === 'femboy'
                ? 'bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-200 ring-1 ring-pink-400/40'
                : 'text-pink-400/70 hover:text-pink-300'
            )}
          >
            <Flame className={cn('h-3 w-3 shrink-0', difficulty === 'femboy' ? 'fill-pink-400 text-pink-300' : 'fill-pink-500/50 text-pink-500/50')} />
            <span className="truncate font-bold uppercase tracking-tight">{DIFFICULTY_CONFIG.femboy.label}</span>
            <span className="text-[9px] opacity-60 shrink-0">{DIFFICULTY_CONFIG.femboy.size}×{DIFFICULTY_CONFIG.femboy.size}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Timer + Errors */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5"><Clock className="h-[14px] w-[14px] text-neutral-600" /><span className="font-mono text-[15px] font-medium tabular-nums text-neutral-400">{formatTime(timeSeconds)}</span></div>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5"><span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Errors</span>
          <div className="flex gap-1">{Array.from({ length: currentMaxErrors }).map((_, i) => (
            <motion.div key={i} animate={{ backgroundColor: i < errorCount ? '#ef4444' : 'rgba(255,255,255,0.08)', scale: i < errorCount ? 1 : 0.85 }} className="flex h-4 w-4 items-center justify-center rounded-md">{i < errorCount && <X className="h-2 w-2 text-white" strokeWidth={3} />}</motion.div>
          ))}</div>
        </div>
      </motion.div>

      {/* Femboy-Modus: Hilfe-Text für split regions */}
      {difficulty === 'femboy' && splitRegionCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cn(
            'mt-2 flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium',
            'bg-pink-500/[0.06] text-pink-300/80 ring-1 ring-pink-500/15'
          )}
        >
          <Flame className="h-2.5 w-2.5 fill-pink-400/70 text-pink-400/70" />
          <span>{splitRegionCount} regions are split — don't put two queens in the same region</span>
        </motion.div>
      )}

      {/* Board */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="mt-4 flex flex-1 flex-col items-center justify-center">
        {cells && <QueensBoard />}
        {/* Femboy-Modus: "crafted with love" Footer unterm Grid + subtile Herz am Ende */}
        {difficulty === 'femboy' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 flex items-center justify-center gap-1.5 text-[10px] italic text-pink-400/60"
            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
          >
            <span>crafted with love for my beautiful girlfriend</span>
            {/* Subtile Herz (SVG, kein Emoji) */}
            <svg
              viewBox="0 0 24 24"
              className="h-2.5 w-2.5 fill-pink-400/50"
              aria-hidden="true"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        )}
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-5 grid w-full max-w-md grid-cols-3 gap-2">
        <motion.button onClick={reset} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] py-2.5 text-[12px] font-medium text-neutral-300 ring-1 ring-white/[0.06] hover:bg-white/[0.08]"><RotateCcw className="h-3.5 w-3.5" />New</motion.button>
        <motion.button onClick={undo} whileTap={{ scale: 0.97 }} disabled={!canUndo} className={cn('flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-medium ring-1', canUndo ? 'bg-white/[0.04] text-neutral-300 ring-white/[0.06] hover:bg-white/[0.08]' : 'cursor-not-allowed bg-white/[0.02] text-neutral-600 ring-white/[0.03]')}><Undo2 className="h-3.5 w-3.5" />Undo</motion.button>
        <motion.button onClick={useHint} whileTap={{ scale: 0.97 }} disabled={hintsLeft === 0} className={cn('flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-medium ring-1', hintsLeft > 0 ? (difficulty === 'femboy' ? 'bg-pink-500/[0.1] text-pink-300 ring-pink-500/25 hover:bg-pink-500/[0.18]' : 'bg-[var(--word-gold)]/[0.08] text-[var(--word-gold)] ring-[var(--word-gold)]/20 hover:bg-[var(--word-gold)]/[0.14]') : 'cursor-not-allowed bg-white/[0.02] text-neutral-600 ring-white/[0.03]')}><Lightbulb className="h-3.5 w-3.5" />Hint {hintsLeft}</motion.button>
      </motion.div>

      {/* Footer */}
      <footer className="mt-6 flex w-full max-w-md flex-col items-center gap-3 px-6 pb-6 pt-4">
        <div className="flex items-center gap-4">
          <motion.a href="https://instagram.com/malikali065" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }} className="group relative flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/10 hover:ring-white/20"><div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 opacity-90 group-hover:opacity-100" /><Instagram className="relative h-[18px] w-[18px] text-white" strokeWidth={2.2} /></motion.a>
          <motion.a href="https://arche-website.pages.dev" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }} className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 ring-1 ring-white/10 hover:ring-white/20"><Globe className="h-[18px] w-[18px] text-white" strokeWidth={2.2} /></motion.a>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-center"><a href="https://instagram.com/malikali065" target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-neutral-300 hover:text-white">@malikali065</a><a href="https://arche-website.pages.dev" target="_blank" rel="noopener noreferrer" className="text-[11px] text-neutral-500 hover:text-neutral-300">arche-website.pages.dev</a></div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><span>Made with</span><Heart className="h-3 w-3 fill-red-500 text-red-500" /><span>by Ali Malik</span></div>
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-700">© 2026 Ali Malik · All Rights Reserved</div>
      </footer>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && lastResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg" onClick={handleNext}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ duration: 0.5 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-950 ring-1 ring-white/[0.08]">
              <div className="h-px w-full" style={{ background: lastResult.won ? 'linear-gradient(90deg, transparent, var(--word-gold), transparent)' : 'linear-gradient(90deg, transparent, var(--word-error), transparent)' }} />
              <div className="p-6 text-center">
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 18 }} className={cn('mx-auto flex h-14 w-14 items-center justify-center rounded-full', lastResult.won ? 'bg-[var(--word-gold)]/[0.12] ring-1 ring-[var(--word-gold)]/20' : 'bg-[var(--word-error)]/[0.12] ring-1 ring-[var(--word-error)]/20')}><Trophy className={cn('h-6 w-6', lastResult.won ? 'text-[var(--word-gold)]' : 'text-[var(--word-error)]')} /></motion.div>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}>{lastResult.won ? 'Solved!' : 'Game Over'}</h2>
                <p className="mt-1 text-[13px] font-light text-neutral-400">{lastResult.won ? `Level ${currentLevel - 1} completed!` : 'Too many errors — try again.'}</p>
                {lastResult.won && (
                  <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--word-gold)]/[0.1] px-4 py-1.5 ring-1 ring-[var(--word-gold)]/20">
                    <Star className="h-3.5 w-3.5 fill-[var(--word-gold)] text-[var(--word-gold)]" />
                    <span className="text-[12px] font-medium text-[var(--word-gold)]">Level {currentLevel}</span>
                  </motion.div>
                )}
                {/* Coins breakdown — original (pre-gamble) when not gambled, gamble summary when gambled */}
                {lastResult.won && lastPfandflaschenEarned > 0 && pfandflaschenBreakdown && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 rounded-xl bg-amber-500/[0.06] px-4 py-3 ring-1 ring-amber-500/15">
                    <div className="flex items-center justify-center gap-2 pb-2">
                      <motion.div initial={{ rotate: -15, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 15 }}><BottleIcon className="h-5 w-5 text-amber-400" /></motion.div>
                      <span className="font-mono text-[18px] font-bold tabular-nums text-amber-300">+{lastPfandflaschenEarned}</span>
                      <span className="text-[11px] text-amber-500/70">{gambled && gambleMultiplier > 1 ? `(${gambleMultiplier}x Gamble!)` : 'Pfandflaschen'}</span>
                    </div>
                    {gambled ? (
                      // Clean gamble summary — no breakdown to avoid "doppelt multipliziert" perception
                      <div className="flex flex-col gap-1 text-[10px] text-neutral-500">
                        <div className="flex justify-between">
                          <span>Einsatz</span>
                          <span className="font-mono text-neutral-300">−{pfandflaschenBreakdown.base - pfandflaschenBreakdown.errorDeduction - pfandflaschenBreakdown.hintDeduction + pfandflaschenBreakdown.timerBonus + pfandflaschenBreakdown.bestTimeBonus + (useQueensStore.getState().currentStreakBonus || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Multiplikator</span>
                          <span className="font-mono text-amber-300">{gambleMultiplier}x</span>
                        </div>
                        <div className="my-1 h-px bg-white/[0.06]" />
                        <div className="flex justify-between">
                          <span className="font-medium text-amber-300">Gewinn</span>
                          <span className="font-mono font-bold text-amber-300">+{lastPfandflaschenEarned}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 text-[10px] text-neutral-500">
                        <div className="flex justify-between"><span>Base</span><span className="font-mono text-neutral-300">{pfandflaschenBreakdown.base}</span></div>
                        {pfandflaschenBreakdown.errorDeduction > 0 && <div className="flex justify-between"><span>Errors (-15% × {errorCount})</span><span className="font-mono text-red-400">-{pfandflaschenBreakdown.errorDeduction}</span></div>}
                        {pfandflaschenBreakdown.hintDeduction > 0 && <div className="flex justify-between"><span>Hints (-20% × {lastResult.hintsUsed})</span><span className="font-mono text-red-400">-{pfandflaschenBreakdown.hintDeduction}</span></div>}
                        {pfandflaschenBreakdown.timerBonus > 0 && <div className="flex justify-between"><span>Timer Bonus (0 Hints!)</span><span className="font-mono text-emerald-400">+{pfandflaschenBreakdown.timerBonus}</span></div>}
                        {pfandflaschenBreakdown.bestTimeBonus > 0 && <div className="flex justify-between"><span>★ New Best Time!</span><span className="font-mono text-[var(--word-gold)]">+{pfandflaschenBreakdown.bestTimeBonus}</span></div>}
                        {useQueensStore.getState().currentStreakBonus > 0 && <div className="flex justify-between"><span>🔥 Win Streak ×{useQueensStore.getState().streaks[difficulty] ?? 0}</span><span className="font-mono text-orange-400">+{useQueensStore.getState().currentStreakBonus}</span></div>}
                      </div>
                    )}
                  </motion.div>
                )}
                {/* Gamble Button */}
                {lastResult.won && !gambled && lastPfandflaschenEarned > 0 && (
                  <motion.button onClick={() => startGamble()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} whileTap={{ scale: 0.97 }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/15 px-4 py-2.5 text-[12px] font-bold text-amber-300 ring-1 ring-amber-500/25 hover:bg-amber-500/25">
                    <span className="text-[14px]">🎰</span>Gamble: {lastPfandflaschenEarned} Pfandflaschen all-in
                  </motion.button>
                )}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/[0.025] p-3 ring-1 ring-white/[0.05]"><Clock className="mx-auto mb-1 h-3 w-3 text-neutral-500" /><div className="font-mono text-sm font-semibold text-neutral-100">{formatTime(lastResult.timeSeconds)}</div><div className="text-[9px] uppercase tracking-wider text-neutral-500">Time</div></div>
                  <div className="rounded-xl bg-white/[0.025] p-3 ring-1 ring-white/[0.05]"><Lightbulb className="mx-auto mb-1 h-3 w-3 text-neutral-500" /><div className="font-mono text-sm font-semibold text-neutral-100">{lastResult.hintsUsed}</div><div className="text-[9px] uppercase tracking-wider text-neutral-500">Hints</div></div>
                </div>
                <motion.button onClick={handleNext} whileTap={{ scale: 0.97 }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-50 px-4 py-3.5 text-[13px] font-medium text-neutral-950 hover:bg-neutral-200"><Crown className="h-4 w-4" />New Puzzle</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStats && <StatsModal />}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && <ShopModal />}
      </AnimatePresence>

      {/* Gamble Modal */}
      <AnimatePresence>
        {showGamble && <GambleModal />}
      </AnimatePresence>
    </div>
  );
}
