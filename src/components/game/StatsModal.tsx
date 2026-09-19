'use client';

import { motion } from 'framer-motion';
import { X, Clock, Trophy, Target, Lightbulb, Star } from 'lucide-react';
import { useGameStore } from '@/lib/game/gameStore';
import { DIFFICULTY_CONFIG, Difficulty } from '@/lib/game/types';
import {
  difficultyLabel,
  formatTime,
  getOverallBestTime,
  getBestDifficulty,
} from '@/lib/game/stats';
import { cn } from '@/lib/utils';

export function StatsModal({ onClose }: { onClose: () => void }) {
  const stats = useGameStore(s => s.stats);

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;
  const avgTime = stats.gamesPlayed > 0
    ? Math.round(stats.totalTime / stats.gamesPlayed)
    : 0;
  const avgErrors = stats.gamesPlayed > 0
    ? (stats.totalErrors / stats.gamesPlayed).toFixed(1)
    : '0.0';
  const avgHints = stats.gamesPlayed > 0
    ? (stats.totalHintsUsed / stats.gamesPlayed).toFixed(1)
    : '0.0';

  const overallBest = getOverallBestTime(stats);
  const bestDiff = getBestDifficulty(stats);
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-neutral-950 ring-1 ring-white/[0.08]"
      >
        {/* Top gradient stripe */}
        <div
          className="h-px w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--word-gold), transparent)',
          }}
        />

        <div className="p-8">
          {/* Header — spacious */}
          <div className="mb-8 flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                Deine Statistiken
              </span>
              <h2
                className="text-3xl font-bold tracking-tight text-neutral-50"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}
              >
                Übersicht
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08] hover:text-white"
              aria-label="Schließen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Top 3 hero stats — generous spacing */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.025] p-5 text-center ring-1 ring-white/[0.05]">
              <Trophy className="h-4 w-4 text-neutral-500" />
              <div className="font-mono text-2xl font-semibold tabular-nums text-neutral-50">{stats.gamesPlayed}</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Spiele</div>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--word-gold)]/[0.05] p-5 text-center ring-1 ring-[var(--word-gold)]/10">
              <Target className="h-4 w-4 text-[var(--word-gold)]" />
              <div className="font-mono text-2xl font-semibold tabular-nums text-[var(--word-gold)]">{winRate}<span className="text-base">%</span></div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Siegrate</div>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.025] p-5 text-center ring-1 ring-white/[0.05]">
              <Star className="h-4 w-4 text-[var(--word-blue)]" />
              <div className="font-mono text-2xl font-semibold tabular-nums text-[var(--word-blue)]">{stats.gamesWon}</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Siege</div>
            </div>
          </div>

          {/* Best time hero card — full width, prominent */}
          <div className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[var(--word-gold)]/[0.08] via-[var(--word-gold)]/[0.03] to-transparent px-6 py-5 ring-1 ring-[var(--word-gold)]/15">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--word-gold)]/15 ring-1 ring-[var(--word-gold)]/25">
                <Clock className="h-4 w-4 text-[var(--word-gold)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Bestzeit</span>
                <span className="text-[13px] font-medium text-neutral-200">
                  {bestDiff ? difficultyLabel(bestDiff) : 'Noch keine Siege'}
                </span>
              </div>
            </div>
            <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--word-gold)]">
              {overallBest !== null ? formatTime(overallBest) : '—'}
            </span>
          </div>

          {/* Section: averages */}
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              Durchschnitte
            </span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>
          <div className="mb-7 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/[0.025] p-4 ring-1 ring-white/[0.05]">
              <div className="text-[9px] uppercase tracking-[0.16em] text-neutral-500">Ø Zeit</div>
              <div className="font-mono text-base font-semibold text-neutral-100">{formatTime(avgTime)}</div>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/[0.025] p-4 ring-1 ring-white/[0.05]">
              <div className="text-[9px] uppercase tracking-[0.16em] text-neutral-500">Ø Fehler</div>
              <div className="font-mono text-base font-semibold text-neutral-100">{avgErrors}</div>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/[0.025] p-4 ring-1 ring-white/[0.05]">
              <div className="text-[9px] uppercase tracking-[0.16em] text-neutral-500">Ø Hinweise</div>
              <div className="font-mono text-base font-semibold text-neutral-100">{avgHints}</div>
            </div>
          </div>

          {/* Section: per-difficulty best times */}
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              Bestzeiten pro Schwierigkeit
            </span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>
          <div className="mb-7 flex flex-col gap-2.5">
            {difficulties.map(d => {
              const cfg = DIFFICULTY_CONFIG[d];
              const best = stats.bestTime[d];
              const bestErr = stats.bestErrors[d];
              const wins = stats.history.filter(h => h.difficulty === d && h.won).length;
              return (
                <div
                  key={d}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.025] px-5 py-4 ring-1 ring-white/[0.05]"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-semibold text-neutral-100">
                      {difficultyLabel(d)}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {cfg.cols}×{cfg.rows} · {wins} {wins === 1 ? 'Sieg' : 'Siege'}
                      {cfg.timeLimit ? ` · ${Math.floor(cfg.timeLimit / 60)}:${String(cfg.timeLimit % 60).padStart(2, '0')} Limit` : ''}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-mono text-[15px] font-semibold tabular-nums text-neutral-100">
                      {best !== null ? formatTime(best) : '—'}
                    </span>
                    {bestErr !== null && (
                      <span className="text-[10px] text-neutral-500">
                        {bestErr} Fehler
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section: last game */}
          {stats.lastGame && (
            <>
              <div className="mb-3 flex items-center gap-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                  Letztes Spiel
                </span>
                <div className="h-px flex-1 bg-white/[0.05]" />
              </div>
              <div className="rounded-2xl bg-white/[0.025] px-5 py-4 ring-1 ring-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-neutral-200">
                    {difficultyLabel(stats.lastGame.difficulty)}
                  </span>
                  <span className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1',
                    stats.lastGame.won
                      ? 'bg-[var(--word-gold)]/[0.1] text-[var(--word-gold)] ring-[var(--word-gold)]/20'
                      : 'bg-[var(--word-error)]/[0.1] text-[var(--word-error)] ring-[var(--word-error)]/20',
                  )}>
                    {stats.lastGame.won ? 'Gewonnen' : 'Verloren'}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 font-mono text-[12px] text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {formatTime(stats.lastGame.timeSeconds)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <X className="h-3 w-3" />
                    {stats.lastGame.errors}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="h-3 w-3" />
                    {stats.lastGame.hintsUsed}
                  </span>
                  <span className="ml-auto">
                    {stats.lastGame.wordsFound}/{stats.lastGame.totalWords}
                  </span>
                  {stats.lastGame.spangramFound && (
                    <Star className="h-3 w-3 fill-[var(--word-gold)] text-[var(--word-gold)]" />
                  )}
                </div>
              </div>
            </>
          )}

          {stats.gamesPlayed === 0 && (
            <p className="mt-4 text-center text-[14px] font-light text-neutral-500">
              Noch keine Spiele gespielt.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
