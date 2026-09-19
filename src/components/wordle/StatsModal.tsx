'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, RotateCcw, Flame, Trophy } from 'lucide-react';
import { useGameStore } from '@/lib/wordle/gameStore';
import { MODE_CONFIG, type GameMode } from '@/lib/wordle/types';
import { cn } from '@/lib/utils';

const WORDLE_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

// Color-Coding pro Mode (gleiche wie Home)
const MODE_ACCENTS: Record<GameMode, { bg: string; text: string; bar: string }> = {
  classic: { bg: 'bg-[#6AAA64]/[0.08]', text: 'text-[#6AAA64]', bar: 'bg-[#6AAA64]' },
  hidden:  { bg: 'bg-[#9B5DE5]/[0.08]', text: 'text-[#9B5DE5]', bar: 'bg-[#9B5DE5]' },
  dual:    { bg: 'bg-[#F18F01]/[0.08]', text: 'text-[#F18F01]', bar: 'bg-[#F18F01]' },
  emoji:   { bg: 'bg-[#EF476F]/[0.08]', text: 'text-[#EF476F]', bar: 'bg-[#EF476F]' },
};

export function StatsModal() {
  const { view, closeModals, stats, resetStats, activeMode } = useGameStore();
  const isOpen = view === 'stats';
  const modes: GameMode[] = ['classic', 'hidden', 'dual', 'emoji'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModals}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md bg-[#121213] ring-1 ring-[#3A3A3C]"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 border-b border-[#3A3A3C] bg-[#121213] px-6 pb-3 pt-5">
              <div className="flex items-start justify-between">
                <h2
                  className="text-[22px] font-bold tracking-tight text-white"
                  style={{ fontFamily: WORDLE_FONT, letterSpacing: '-0.02em' }}
                >
                  Statistics
                </h2>
                <button
                  onClick={closeModals}
                  className="flex h-9 w-9 items-center justify-center rounded text-white hover:bg-[#1a1a1a]"
                >
                  <X className="h-5 w-5" strokeWidth={2.4} />
                </button>
              </div>

              {/* Mode-Tabs (Apple-Style Pill Tabs mit Color-Coding) */}
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {modes.map(m => {
                  const isActive = activeMode === m;
                  const accent = MODE_ACCENTS[m];
                  return (
                    <button
                      key={m}
                      onClick={() => useGameStore.setState({ activeMode: m })}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider transition-all',
                        isActive
                          ? cn(accent.bg, accent.text, 'ring-1 ring-current/30')
                          : 'bg-[#1a1a1a] text-[#818384] ring-1 ring-[#3A3A3C] hover:text-white'
                      )}
                      style={{ fontFamily: WORDLE_FONT }}
                    >
                      {MODE_CONFIG[m].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 pt-5">
              {(() => {
                const ms = stats.modes[activeMode];
                const total = ms.distribution.reduce((a, b) => a + b, 0);
                const maxBar = Math.max(...ms.distribution, 1);
                const winRate = ms.played > 0 ? Math.round((ms.won / ms.played) * 100) : 0;
                const accent = MODE_ACCENTS[activeMode];

                return (
                  <>
                    {/* Stat-Kacheln (2x2 Grid, mehr Spacing, Apple-Style) */}
                    <div className="mb-6 grid grid-cols-2 gap-3">
                      <StatCard label="Played" value={ms.played} />
                      <StatCard label="Win Rate" value={`${winRate}%`} />
                      <StatCard label="Current Streak" value={ms.currentStreak} icon={<Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />} />
                      <StatCard label="Best Streak" value={ms.maxStreak} icon={<Trophy className="h-3.5 w-3.5 text-[#6AAA64]" />} />
                    </div>

                    {/* Guess Distribution (Color-coded Bars) */}
                    <div className="border-t border-[#3A3A3C] pt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-white" strokeWidth={2.4} />
                          <span
                            className="text-[12px] font-bold uppercase tracking-wider text-white"
                            style={{ fontFamily: WORDLE_FONT }}
                          >
                            Guess Distribution
                          </span>
                        </div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#818384]" style={{ fontFamily: WORDLE_FONT }}>
                          {total} {total === 1 ? 'game' : 'games'}
                        </span>
                      </div>

                      {/* Bars */}
                      <div className="flex flex-col gap-2">
                        {ms.distribution.map((count, i) => {
                          const pct = total > 0 ? Math.max(count / maxBar * 100, count > 0 ? 8 : 4) : 4;
                          const isMax = count === maxBar && count > 0;
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-3 text-[11px] font-bold text-[#818384]" style={{ fontFamily: WORDLE_FONT }}>{i + 1}</span>
                              <div className="relative h-[26px] flex-1 overflow-hidden rounded-sm bg-[#1a1a1a] ring-1 ring-[#3A3A3C]">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                  className={cn(
                                    'flex h-full items-center justify-end rounded-sm px-2 transition-colors',
                                    isMax ? cn(accent.bar, 'opacity-100') : cn(accent.bar, 'opacity-70')
                                  )}
                                  style={{ minWidth: count > 0 ? '36px' : '0' }}
                                >
                                  <span className="text-[11px] font-bold text-white" style={{ fontFamily: WORDLE_FONT }}>{count}</span>
                                </motion.div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reset-Button */}
                    <button
                      onClick={() => {
                        if (confirm('Reset all stats?')) resetStats();
                      }}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#3A3A3C] py-2.5 text-[12px] font-bold text-white hover:bg-[#565758]"
                      style={{ fontFamily: WORDLE_FONT }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset Stats
                    </button>
                  </>
                );
              })()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Stat-Kachel Komponente ───
function StatCard({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#1a1a1a] p-3 ring-1 ring-[#3A3A3C]">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <div className="font-mono text-[26px] font-bold tabular-nums text-white" style={{ fontFamily: WORDLE_FONT }}>{value}</div>
      </div>
      <div className="mt-1 text-center text-[10px] font-medium uppercase tracking-wider text-[#818384]" style={{ fontFamily: WORDLE_FONT }}>{label}</div>
    </div>
  );
}
