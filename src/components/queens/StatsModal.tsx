'use client';

import { motion } from 'framer-motion';
import {
  X, Trophy, Star, Crown, Clock, Target, Zap, Flame,
} from 'lucide-react';
import { BottleIcon } from "@/components/queens/BottleIcon";
import { useQueensStore } from '@/lib/queens/queensStore';
import { DIFFICULTY_CONFIG, Difficulty } from '@/lib/queens/types';
import { cn } from '@/lib/utils';

function formatTime(s: number) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#52BE80',
  normal: '#5DADE2',
  extreme: '#EC7063',
};

export function StatsModal() {
  const stats = useQueensStore(s => s.stats);
  const levels = useQueensStore(s => s.levels);
  const streaks = useQueensStore(s => s.streaks);
  const coins = useQueensStore(s => s.coins);
  const toggleStats = useQueensStore(s => s.toggleStats);
  const difficulties: Difficulty[] = ['easy', 'normal', 'extreme'];

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const avgTime = stats.gamesPlayed > 0 ? Math.round(stats.totalTime / stats.gamesPlayed) : 0;
  const avgHints = stats.gamesPlayed > 0 ? (stats.totalHints / stats.gamesPlayed).toFixed(1) : '0.0';

  // Per difficulty: wins, losses, Pfandflaschen collected, total games
  const perDiff = difficulties.map(d => {
    const games = stats.history.filter(h => h.difficulty === d);
    const wins = games.filter(g => g.won).length;
    const losses = games.length - wins;
    const totalPfandflaschen = games.filter(g => g.won).reduce((sum, g) => sum + (g.pfandflaschenEarned ?? 0), 0);
    return { difficulty: d, wins, losses, total: games.length, totalPfandflaschen };
  });

  // Recent 5 games
  const recentGames = stats.history.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={toggleStats}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-neutral-950 ring-1 ring-white/[0.08]"
      >
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--word-gold), transparent)' }} />

        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-neutral-950/95 px-6 pb-3 pt-5 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">Statistics</span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}>Overview</h2>
            </div>
            <button onClick={toggleStats} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Hero Stats — 3 large cards with bigger fonts */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              { icon: <Trophy className="h-6 w-6" />, value: stats.gamesPlayed, label: 'Games', color: 'text-neutral-200', bg: 'bg-white/[0.03] ring-white/[0.06]' },
              { icon: <Star className="h-6 w-6" />, value: `${winRate}%`, label: 'Win Rate', color: 'text-[var(--word-gold)]', bg: 'bg-[var(--word-gold)]/[0.06] ring-[var(--word-gold)]/12' },
              { icon: <Crown className="h-6 w-6" />, value: stats.gamesWon, label: 'Wins', color: 'text-[var(--word-blue)]', bg: 'bg-white/[0.03] ring-white/[0.06]' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn('flex flex-col items-center gap-3 rounded-2xl p-6 text-center ring-1', item.bg)}
              >
                <span className={item.color}>{item.icon}</span>
                <span className={cn('font-mono text-3xl font-bold tabular-nums', item.color)}>{item.value}</span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Coins Balance — Hero Card with bigger fonts */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500/[0.1] via-amber-500/[0.05] to-transparent px-6 py-5 ring-1 ring-amber-500/15"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/25">
                <BottleIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-400">Total Pfandflaschen</span>
                <span className="font-mono text-3xl font-bold tabular-nums text-amber-300">{coins}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] uppercase tracking-wider text-neutral-500">All Time</span>
              <span className="font-mono text-lg font-semibold tabular-nums text-amber-400/70">{stats.totalPfandflaschen ?? 0}</span>
            </div>
          </motion.div>

          {/* Averages — bigger fonts */}
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">Averages</span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.05]">
              <Clock className="h-5 w-5 text-neutral-400" />
              <div className="flex flex-col">
                <span className="font-mono text-xl font-bold text-neutral-100">{formatTime(avgTime)}</span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">Avg Time</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.05]">
              <Target className="h-5 w-5 text-neutral-400" />
              <div className="flex flex-col">
                <span className="font-mono text-xl font-bold text-neutral-100">{avgHints}</span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">Avg Hints</span>
              </div>
            </motion.div>
          </div>

          {/* By Difficulty — with win/loss bars + Pfandflaschen collected */}
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">By Difficulty</span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>
          <div className="mb-6 flex flex-col gap-3">
            {difficulties.map((d, idx) => {
              const cfg = DIFFICULTY_CONFIG[d];
              const best = stats.bestTime[d];
              const lvl = levels[d] ?? 1;
              const streak = streaks[d] ?? 0;
              const color = DIFFICULTY_COLORS[d];
              const data = perDiff.find(p => p.difficulty === d)!;
              const winPct = data.total > 0 ? (data.wins / data.total) * 100 : 0;
              const lossPct = data.total > 0 ? (data.losses / data.total) * 100 : 0;

              return (
                <motion.div
                  key={d}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                  className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06]"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[18px] font-bold text-neutral-50">{cfg.label}</span>
                      <span className="text-[12px] text-neutral-500">{cfg.size}×{cfg.size}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-neutral-400">Lvl</span>
                        <span className="font-mono text-xl font-bold tabular-nums text-[var(--word-gold)]">{lvl}</span>
                      </div>
                      {streak >= 2 && (
                        <div className="flex items-center gap-1 rounded-full bg-orange-500/[0.12] px-2 py-1">
                          <Flame className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                          <span className="font-mono text-[14px] font-bold tabular-nums text-orange-400">{streak}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats grid — bigger, clearer */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Best Time</span>
                      <span className="font-mono text-[16px] font-bold text-neutral-100">{best !== null ? formatTime(best) : '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Wins</span>
                      <span className="font-mono text-[16px] font-bold text-emerald-400">{data.wins}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Losses</span>
                      <span className="font-mono text-[16px] font-bold text-red-400">{data.losses}</span>
                    </div>
                  </div>

                  {/* Win/Loss Bar — 2-color split, thick */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} /><span className="text-neutral-400">Won {data.wins}</span></span>
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500/40" /><span className="text-neutral-400">Lost {data.losses}</span></span>
                    </div>
                    <div className="flex h-5 w-full overflow-hidden rounded-lg bg-white/[0.03] ring-1 ring-white/[0.04]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${winPct}%` }}
                        transition={{ delay: 0.6 + idx * 0.08, duration: 0.6, ease: 'easeOut' }}
                        className="h-full"
                        style={{ backgroundColor: color }}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lossPct}%` }}
                        transition={{ delay: 0.6 + idx * 0.08, duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-red-500/30"
                      />
                    </div>
                  </div>

                  {/* Pfandflaschen Collected — big, clear */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-500/[0.06] px-4 py-3 ring-1 ring-amber-500/15">
                    <div className="flex items-center gap-2">
                      <BottleIcon className="h-5 w-5 text-amber-400" />
                      <span className="text-[13px] font-medium text-amber-500/80">Pfandflaschen Collected</span>
                    </div>
                    <span className="font-mono text-2xl font-bold tabular-nums text-amber-300">{data.totalPfandflaschen}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recent 5 Games */}
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">Recent Games</span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>
          {recentGames.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentGames.map((game, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.025] px-4 py-3 ring-1 ring-white/[0.04]"
                >
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: game.won ? DIFFICULTY_COLORS[game.difficulty] : '#ef4444' }} />
                  <span className="text-[13px] font-semibold text-neutral-200">{DIFFICULTY_CONFIG[game.difficulty].label}</span>
                  <span className="font-mono text-[12px] text-neutral-400">{formatTime(game.timeSeconds)}</span>
                  <span className="font-mono text-[12px] text-neutral-500">{game.hintsUsed}h</span>
                  {(game.pfandflaschenEarned ?? 0) > 0 && <span className="ml-auto flex items-center gap-1 font-mono text-[13px] font-semibold text-amber-400/80"><BottleIcon className="h-3.5 w-3.5" />{game.pfandflaschenEarned ?? 0}</span>}
                  {game.won && <Star className="h-3.5 w-3.5 fill-[var(--word-gold)] text-[var(--word-gold)]" />}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-[15px] font-light text-neutral-500">No games played yet.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
