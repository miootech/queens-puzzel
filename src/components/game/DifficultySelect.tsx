'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Flame, Sparkles } from 'lucide-react';
import { useGameStore } from '@/lib/game/gameStore';
import { DIFFICULTY_CONFIG, Difficulty } from '@/lib/game/types';
import { formatTime } from '@/lib/game/stats';
import { cn } from '@/lib/utils';

interface DiffOption {
  key: Difficulty;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  ring: string;
  glow: string;
}

const OPTIONS: DiffOption[] = [
  {
    key: 'easy',
    icon: <Sparkles className="h-[18px] w-[18px]" />,
    title: 'Leicht',
    description: '3 Themenwörter + Spangram · kein Zeitlimit',
    accent: 'text-emerald-300',
    ring: 'hover:ring-emerald-400/20',
    glow: 'hover:shadow-[0_8px_30px_rgba(82,190,128,0.08)]',
  },
  {
    key: 'medium',
    icon: <Clock className="h-[18px] w-[18px]" />,
    title: 'Mittel',
    description: '5 Themenwörter + Spangram · kein Zeitlimit',
    accent: 'text-amber-300',
    ring: 'hover:ring-amber-400/20',
    glow: 'hover:shadow-[0_8px_30px_rgba(245,176,65,0.08)]',
  },
  {
    key: 'hard',
    icon: <Flame className="h-[18px] w-[18px]" />,
    title: 'Schwer',
    description: '6 Themenwörter + Spangram · 3:00 Min. Countdown',
    accent: 'text-red-300',
    ring: 'hover:ring-red-400/20',
    glow: 'hover:shadow-[0_8px_30px_rgba(239,68,68,0.08)]',
  },
];

export function DifficultySelect() {
  const startGame = useGameStore(s => s.startGame);
  const goToMenu = useGameStore(s => s.goToMenu);
  const stats = useGameStore(s => s.stats);

  return (
    <div className="bg-mesh relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-10">
      <motion.button
        onClick={goToMenu}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        whileTap={{ scale: 0.92 }}
        className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.08] backdrop-blur-xl transition-colors hover:bg-white/[0.08] hover:text-white"
        aria-label="Zurück"
      >
        <ArrowLeft className="h-[18px] w-[18px]" />
      </motion.button>

      <div className="flex w-full max-w-xl flex-col items-center gap-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
            Wähle deinen Modus
          </span>
          <h2
            className="text-4xl font-bold tracking-tight text-neutral-50 sm:text-5xl"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}
          >
            Schwierigkeit
          </h2>
        </motion.div>

        <div className="flex w-full flex-col gap-2.5">
          {OPTIONS.map((opt, idx) => {
            const cfg = DIFFICULTY_CONFIG[opt.key];
            const best = stats.bestTime[opt.key];
            const wins = stats.history.filter(
              h => h.difficulty === opt.key && h.won
            ).length;
            return (
              <motion.button
                key={opt.key}
                onClick={() => startGame(opt.key)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  'group flex items-center gap-4 rounded-2xl bg-white/[0.025] p-4 text-left ring-1 ring-white/[0.06] backdrop-blur-xl transition-all sm:p-5',
                  opt.ring,
                  opt.glow,
                )}
              >
                <div className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.05]'
                )}>
                  <span className={opt.accent}>{opt.icon}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[17px] font-semibold text-neutral-50">{opt.title}</span>
                    {best !== null && (
                      <span className="flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium tabular-nums text-neutral-400">
                        <span className="text-[var(--word-gold)]">★</span>
                        {formatTime(best)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] text-neutral-400">{opt.description}</p>
                  {wins > 0 && (
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                      {wins} Siege · {cfg.maxErrors} Fehler erlaubt
                    </p>
                  )}
                </div>

                <div className="text-xl font-light text-neutral-700 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-400">
                  →
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Spangram info card — clean, breathable */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-2 flex items-start gap-3 rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/[0.05]"
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--word-gold)]/10 ring-1 ring-[var(--word-gold)]/20">
            <span className="text-[var(--word-gold)] text-sm">★</span>
          </div>
          <p className="text-[12px] leading-relaxed text-neutral-400">
            Jedes Rätsel enthält ein{' '}
            <span className="font-medium text-[var(--word-gold)]">goldenes Spangram</span>,
            das das Thema beschreibt und das Spielfeld von einer Seite zur anderen durchzieht.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
