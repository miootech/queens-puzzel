'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Clock, RotateCcw, Undo2, Lightbulb, BarChart3,
  X, Trophy, Star, Heart, Instagram, Globe,
} from 'lucide-react';
import { useQueensStore } from '@/lib/queens/queensStore';
import { MAX_HINTS, MAX_ERRORS, DIFFICULTY_CONFIG, Difficulty } from '@/lib/queens/types';
import { QueensBoard } from '@/components/queens/QueensBoard';
import { cn } from '@/lib/utils';

function formatTime(s: number) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }

export default function QueensPage() {
  const cells = useQueensStore(s => s.cells);
  const size = useQueensStore(s => s.size);
  const difficulty = useQueensStore(s => s.difficulty);
  const timeSeconds = useQueensStore(s => s.timeSeconds);
  const isRunning = useQueensStore(s => s.isRunning);
  const isGameOver = useQueensStore(s => s.isGameOver);
  const hasWon = useQueensStore(s => s.hasWon);
  const hintsUsed = useQueensStore(s => s.hintsUsed);
  const errorCount = useQueensStore(s => s.errorCount);
  const historyLen = useQueensStore(s => s.history.length);
  const showResult = useQueensStore(s => s.showResult);
  const lastResult = useQueensStore(s => s.lastResult);
  const stats = useQueensStore(s => s.stats);
  const showStats = useQueensStore(s => s.showStats);
  const tick = useQueensStore(s => s.tick);
  const startNewGame = useQueensStore(s => s.startNewGame);
  const setDifficulty = useQueensStore(s => s.setDifficulty);
  const undo = useQueensStore(s => s.undo);
  const reset = useQueensStore(s => s.reset);
  const useHint = useQueensStore(s => s.useHint);
  const toggleStats = useQueensStore(s => s.toggleStats);
  const dismissResult = useQueensStore(s => s.dismissResult);

  const init = useRef(false);
  useEffect(() => { if (!init.current) { init.current = true; startNewGame(); } }, [startNewGame]);
  useEffect(() => { if (!isRunning) return; const i = setInterval(() => tick(), 1000); return () => clearInterval(i); }, [isRunning, tick]);

  const hintsLeft = MAX_HINTS - hintsUsed;
  const canUndo = historyLen > 1;
  const difficulties: Difficulty[] = ['easy', 'normal', 'extreme'];

  const handleNext = () => { dismissResult(); startNewGame(); };

  return (
    <div className="bg-mesh relative flex min-h-screen w-full flex-col items-center px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex w-full max-w-md items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 to-rose-500/30 ring-1 ring-white/10"><Crown className="h-4 w-4 fill-amber-300 text-amber-300" /></div>
          <div className="flex flex-col"><span className="text-[9px] font-medium uppercase tracking-[0.22em] text-neutral-500">Logikrätsel</span><span className="text-[16px] font-semibold leading-none tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Queens</span></div>
        </div>
        <motion.button onClick={toggleStats} whileTap={{ scale: 0.92 }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-white" aria-label="Statistiken"><BarChart3 className="h-[16px] w-[16px]" /></motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-3 flex w-full max-w-md items-center justify-center gap-1.5 rounded-full bg-white/[0.03] p-1 ring-1 ring-white/[0.05]">
        {difficulties.map(d => { const cfg = DIFFICULTY_CONFIG[d]; const isActive = difficulty === d; return (
          <motion.button key={d} onClick={() => setDifficulty(d)} whileTap={{ scale: 0.95 }} className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors', isActive ? 'bg-white/[0.1] text-neutral-50 ring-1 ring-white/10' : 'text-neutral-500 hover:text-neutral-300')}>{cfg.label}<span className="text-[9px] opacity-60">{cfg.size}×{cfg.size}</span></motion.button>
        ); })}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5"><Clock className="h-[14px] w-[14px] text-neutral-600" /><span className="font-mono text-[15px] font-medium tabular-nums text-neutral-400">{formatTime(timeSeconds)}</span></div>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5"><span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Fehler</span>
          <div className="flex gap-1">{Array.from({ length: MAX_ERRORS }).map((_, i) => (
            <motion.div key={i} animate={{ backgroundColor: i < errorCount ? '#ef4444' : 'rgba(255,255,255,0.08)', scale: i < errorCount ? 1 : 0.85 }} className="flex h-4 w-4 items-center justify-center rounded-md">{i < errorCount && <X className="h-2 w-2 text-white" strokeWidth={3} />}</motion.div>
          ))}</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="mt-4 flex flex-1 flex-col items-center justify-center">{cells && <QueensBoard />}</motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-5 grid w-full max-w-md grid-cols-3 gap-2">
        <motion.button onClick={reset} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] py-2.5 text-[12px] font-medium text-neutral-300 ring-1 ring-white/[0.06] hover:bg-white/[0.08]"><RotateCcw className="h-3.5 w-3.5" />Reset</motion.button>
        <motion.button onClick={undo} whileTap={{ scale: 0.97 }} disabled={!canUndo} className={cn('flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-medium ring-1', canUndo ? 'bg-white/[0.04] text-neutral-300 ring-white/[0.06] hover:bg-white/[0.08]' : 'cursor-not-allowed bg-white/[0.02] text-neutral-600 ring-white/[0.03]')}><Undo2 className="h-3.5 w-3.5" />Undo</motion.button>
        <motion.button onClick={useHint} whileTap={{ scale: 0.97 }} disabled={hintsLeft === 0} className={cn('flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-medium ring-1', hintsLeft > 0 ? 'bg-[var(--word-gold)]/[0.08] text-[var(--word-gold)] ring-[var(--word-gold)]/20 hover:bg-[var(--word-gold)]/[0.14]' : 'cursor-not-allowed bg-white/[0.02] text-neutral-600 ring-white/[0.03]')}><Lightbulb className="h-3.5 w-3.5" />Tipp {hintsLeft}</motion.button>
      </motion.div>

      <footer className="mt-6 flex w-full max-w-md flex-col items-center gap-3 px-6 pb-6 pt-4">
        <div className="flex items-center gap-4">
          <motion.a href="https://instagram.com/malikali065" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }} className="group relative flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/10 hover:ring-white/20"><div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 opacity-90 group-hover:opacity-100" /><Instagram className="relative h-[18px] w-[18px] text-white" strokeWidth={2.2} /></motion.a>
          <motion.a href="https://arche-website.pages.dev" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }} className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 ring-1 ring-white/10 hover:ring-white/20"><Globe className="h-[18px] w-[18px] text-white" strokeWidth={2.2} /></motion.a>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-center"><a href="https://instagram.com/malikali065" target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-neutral-300 hover:text-white">@malikali065</a><a href="https://arche-website.pages.dev" target="_blank" rel="noopener noreferrer" className="text-[11px] text-neutral-500 hover:text-neutral-300">arche-website.pages.dev</a></div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><span>Entwickelt mit</span><Heart className="h-3 w-3 fill-red-500 text-red-500" /><span>von Ali Malik</span></div>
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-700">© 2026 Ali Malik · All Rights Reserved</div>
      </footer>

      <AnimatePresence>
        {showResult && lastResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg" onClick={handleNext}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ duration: 0.5 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-950 ring-1 ring-white/[0.08]">
              <div className="h-px w-full" style={{ background: hasWon ? 'linear-gradient(90deg, transparent, var(--word-gold), transparent)' : 'linear-gradient(90deg, transparent, var(--word-error), transparent)' }} />
              <div className="p-6 text-center">
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 18 }} className={cn('mx-auto flex h-14 w-14 items-center justify-center rounded-full', hasWon ? 'bg-[var(--word-gold)]/[0.12] ring-1 ring-[var(--word-gold)]/20' : 'bg-[var(--word-error)]/[0.12] ring-1 ring-[var(--word-error)]/20')}><Trophy className={cn('h-6 w-6', hasWon ? 'text-[var(--word-gold)]' : 'text-[var(--word-error)]')} /></motion.div>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}>{hasWon ? 'Geschafft' : 'Verloren'}</h2>
                <p className="mt-1 text-[13px] font-light text-neutral-400">{hasWon ? 'Alle Kronen richtig platziert.' : 'Zu viele Fehler — versuche es noch einmal.'}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/[0.025] p-3 ring-1 ring-white/[0.05]"><Clock className="mx-auto mb-1 h-3 w-3 text-neutral-500" /><div className="font-mono text-sm font-semibold text-neutral-100">{formatTime(lastResult.timeSeconds)}</div><div className="text-[9px] uppercase tracking-wider text-neutral-500">Zeit</div></div>
                  <div className="rounded-xl bg-white/[0.025] p-3 ring-1 ring-white/[0.05]"><Lightbulb className="mx-auto mb-1 h-3 w-3 text-neutral-500" /><div className="font-mono text-sm font-semibold text-neutral-100">{lastResult.hintsUsed}</div><div className="text-[9px] uppercase tracking-wider text-neutral-500">Tipps</div></div>
                </div>
                <motion.button onClick={handleNext} whileTap={{ scale: 0.97 }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-50 px-4 py-3.5 text-[13px] font-medium text-neutral-950 hover:bg-neutral-200"><Crown className="h-4 w-4" />Neues Rätsel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleStats} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg">
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ duration: 0.5 }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-neutral-950 ring-1 ring-white/[0.08]">
              <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--word-gold), transparent)' }} />
              <div className="p-8">
                <div className="mb-8 flex items-start justify-between"><div className="flex flex-col gap-1"><span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">Queens Statistiken</span><h2 className="text-3xl font-bold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Übersicht</h2></div><button onClick={toggleStats} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-white"><X className="h-4 w-4" /></button></div>
                <div className="mb-6 grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.025] p-5 text-center ring-1 ring-white/[0.05]"><Trophy className="h-4 w-4 text-neutral-500" /><div className="font-mono text-2xl font-semibold tabular-nums text-neutral-50">{stats.gamesPlayed}</div><div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Spiele</div></div>
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--word-gold)]/[0.05] p-5 text-center ring-1 ring-[var(--word-gold)]/10"><Star className="h-4 w-4 text-[var(--word-gold)]" /><div className="font-mono text-2xl font-semibold tabular-nums text-[var(--word-gold)]">{stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%</div><div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Siegrate</div></div>
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.025] p-5 text-center ring-1 ring-white/[0.05]"><Crown className="h-4 w-4 text-[var(--word-blue)]" /><div className="font-mono text-2xl font-semibold tabular-nums text-[var(--word-blue)]">{stats.gamesWon}</div><div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Siege</div></div>
                </div>
                {stats.gamesPlayed === 0 && <p className="text-center text-[14px] font-light text-neutral-500">Noch keine Spiele gespielt.</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
