'use client';

import { motion } from 'framer-motion';
import { Home, RotateCcw, TrendingUp, TrendingDown, Minus, Star, Clock, X, Lightbulb, Trophy } from 'lucide-react';
import { useGameStore } from '@/lib/game/gameStore';
import { DIFFICULTY_CONFIG } from '@/lib/game/types';
import { difficultyLabel, formatTime } from '@/lib/game/stats';
import { cn } from '@/lib/utils';

interface StatRowProps {
  label: string;
  value: string;
  delta?: number | null;
  deltaType?: 'better' | 'worse' | 'same';
  highlight?: boolean;
}

function StatRow({ label, value, delta, deltaType, highlight }: StatRowProps) {
  const DeltaIcon = deltaType === 'better' ? TrendingUp : deltaType === 'worse' ? TrendingDown : Minus;
  return (
    <div className={cn(
      'flex items-center justify-between rounded-xl px-4 py-2.5 ring-1 transition-colors',
      highlight
        ? 'bg-[var(--word-gold)]/[0.06] ring-[var(--word-gold)]/15'
        : 'bg-white/[0.025] ring-white/[0.05]',
    )}>
      <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn(
          'font-mono text-[15px] font-semibold tabular-nums',
          highlight ? 'text-[var(--word-gold)]' : 'text-neutral-100',
        )}>
          {value}
        </span>
        {delta !== undefined && delta !== null && deltaType && (
          <span className={cn(
            'flex items-center gap-0.5 text-[10px] font-medium',
            deltaType === 'better' && 'text-emerald-400',
            deltaType === 'worse' && 'text-red-400',
            deltaType === 'same' && 'text-neutral-500',
          )}>
            <DeltaIcon className="h-3 w-3" />
            {delta > 0 && '+'}{delta}
          </span>
        )}
      </div>
    </div>
  );
}

export function GameOverModal() {
  const lastResult = useGameStore(s => s.lastResult);
  const placedWords = useGameStore(s => s.placedWords);
  const foundWords = useGameStore(s => s.foundWords);
  const foundSpangram = useGameStore(s => s.foundSpangram);
  const stats = useGameStore(s => s.stats);
  const restart = useGameStore(s => s.restart);
  const goToMenu = useGameStore(s => s.goToMenu);

  if (!lastResult) return null;

  const won = lastResult.won;
  const prev = stats.history[1] ?? null;
  const best = stats.bestTime[lastResult.difficulty];
  const bestErrors = stats.bestErrors[lastResult.difficulty];

  // Compute missing words (only relevant on loss)
  const missingWords = won
    ? []
    : placedWords.filter(pw =>
        pw.isSpangram ? !foundSpangram : !foundWords.includes(pw.word)
      );

  const timeDelta = prev ? lastResult.timeSeconds - prev.timeSeconds : null;
  const errDelta = prev ? lastResult.errors - prev.errors : null;

  const timeDeltaType: 'better' | 'worse' | 'same' | null =
    timeDelta === null ? null
    : timeDelta < 0 ? 'better'
    : timeDelta > 0 ? 'worse'
    : 'same';
  const errDeltaType: 'better' | 'worse' | 'same' | null =
    errDelta === null ? null
    : errDelta < 0 ? 'better'
    : errDelta > 0 ? 'worse'
    : 'same';

  const newBestTime = won && best !== null && lastResult.timeSeconds === best;
  const newBestErrors = won && bestErrors !== null && lastResult.errors === bestErrors && bestErrors <= 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-neutral-950 ring-1 ring-white/[0.08]"
      >
        {/* Header gradient stripe */}
        <div
          className="h-px w-full"
          style={{
            background: won
              ? 'linear-gradient(90deg, transparent, var(--word-gold), transparent)'
              : 'linear-gradient(90deg, transparent, var(--word-error), transparent)',
          }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 18 }}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full',
                won
                  ? 'bg-[var(--word-gold)]/[0.12] ring-1 ring-[var(--word-gold)]/20'
                  : 'bg-[var(--word-error)]/[0.12] ring-1 ring-[var(--word-error)]/20',
              )}
            >
              <Trophy className={cn(
                'h-6 w-6',
                won ? 'text-[var(--word-gold)]' : 'text-[var(--word-error)]'
              )} />
            </motion.div>
            <div>
              <h2
                className="text-3xl font-bold tracking-tight text-neutral-50"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}
              >
                {won ? 'Geschafft' : 'Verloren'}
              </h2>
              <p className="mt-1 text-[13px] font-light text-neutral-400">
                {won
                  ? 'Du hast alle Wörter gefunden.'
                  : lastResult.timeSeconds >= (DIFFICULTY_CONFIG[lastResult.difficulty].timeLimit ?? Infinity)
                    ? 'Die Zeit ist abgelaufen.'
                    : 'Zu viele Fehler — versuche es noch einmal.'}
              </p>
            </div>
            {newBestTime && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 18 }}
                className="flex items-center gap-1.5 rounded-full bg-[var(--word-gold)]/[0.1] px-3 py-1 text-[11px] font-medium text-[var(--word-gold)] ring-1 ring-[var(--word-gold)]/20"
              >
                <Star className="h-3 w-3 fill-[var(--word-gold)]" />
                Neue Bestzeit!
              </motion.span>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-col gap-1.5">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                {difficultyLabel(lastResult.difficulty)}
              </span>
              <span className="text-[10px] tabular-nums text-neutral-600">
                {new Date(lastResult.date).toLocaleString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </span>
            </div>

            <StatRow
              label="Zeit"
              value={formatTime(lastResult.timeSeconds)}
              delta={timeDelta !== null ? Math.abs(timeDelta) : null}
              deltaType={timeDeltaType ?? undefined}
              highlight={newBestTime}
            />
            <StatRow
              label="Fehler"
              value={`${lastResult.errors}`}
              delta={errDelta !== null ? Math.abs(errDelta) : null}
              deltaType={errDeltaType ?? undefined}
            />
            <StatRow
              label="Hinweise"
              value={`${lastResult.hintsUsed}`}
            />
            <StatRow
              label="Wörter"
              value={`${lastResult.wordsFound} / ${lastResult.totalWords}`}
            />
            <StatRow
              label="Spangram"
              value={lastResult.spangramFound ? '★ Gefunden' : '—'}
              highlight={lastResult.spangramFound}
            />
          </div>

          {/* Missing words — only shown on loss */}
          {!won && missingWords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-5"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                  Fehlende Wörter
                </span>
                <div className="h-px flex-1 bg-white/[0.05]" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingWords.map((pw, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[12px] font-semibold ring-1',
                      pw.isSpangram
                        ? 'bg-[var(--word-gold)]/[0.08] text-[var(--word-gold)] ring-[var(--word-gold)]/20'
                        : 'bg-[var(--word-error)]/[0.08] text-[var(--word-error)] ring-[var(--word-error)]/20'
                    )}
                  >
                    {pw.isSpangram ? '★ ' : ''}{pw.word}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-2.5">
            <motion.button
              onClick={goToMenu}
              whileTap={{ scale: 0.97 }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.04] px-4 py-3.5 text-[13px] font-medium text-neutral-200 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08]"
            >
              <Home className="h-4 w-4" />
              Menü
            </motion.button>
            <motion.button
              onClick={restart}
              whileTap={{ scale: 0.97 }}
              className="flex flex-[1.3] items-center justify-center gap-2 rounded-xl bg-neutral-50 px-4 py-3.5 text-[13px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200"
            >
              <RotateCcw className="h-4 w-4" />
              Neues Spiel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
