'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { BottleIcon } from "@/components/queens/BottleIcon";
import { useQueensStore } from '@/lib/queens/queensStore';
import { cn } from '@/lib/utils';

// Gamble probabilities (from user spec):
// 50% → 1x (bet back), 25% → 2x, 15% → 3x, 8% → 4x, 2% → 5x
// Note: 4x is not in user spec but included for fairness
const GAMBLE_SLOTS = [
  { multiplier: 1, probability: 0.50, color: '#3a3a3c', label: '1x' },
  { multiplier: 2, probability: 0.25, color: '#6aaa64', label: '2x' },
  { multiplier: 3, probability: 0.15, color: '#c9b458', label: '3x' },
  { multiplier: 4, probability: 0.08, color: '#e8833a', label: '4x' },
  { multiplier: 5, probability: 0.02, color: '#ef4444', label: '5x' },
];

function spin(): number {
  const rand = Math.random();
  let cumulative = 0;
  for (const slot of GAMBLE_SLOTS) {
    cumulative += slot.probability;
    if (rand < cumulative) return slot.multiplier;
  }
  return 1; // fallback
}

export function GambleModal() {
  const showGamble = useQueensStore(s => s.showGamble);
  const gambleBet = useQueensStore(s => s.gambleBet);
  const coins = useQueensStore(s => s.coins);
  const gambled = useQueensStore(s => s.gambled);
  const gambleMultiplier = useQueensStore(s => s.gambleMultiplier);
  const skipGamble = useQueensStore(s => s.skipGamble);
  const applyGamble = useQueensStore(s => s.applyGamble);

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  if (!showGamble) return null;

  const handleSpin = () => {
    if (spinning || hasSpun) return;
    setSpinning(true);
    setResult(null);

    // Determine the result
    const multiplier = spin();

    // Calculate which slot the wheel lands on
    // The wheel has 5 segments, each sized by probability
    // We need to find the angle for the winning slot
    let cumulativeAngle = 0;
    const slotAngles: { multiplier: number; startAngle: number; endAngle: number }[] = [];
    for (const slot of GAMBLE_SLOTS) {
      const angle = slot.probability * 360;
      slotAngles.push({ multiplier: slot.multiplier, startAngle: cumulativeAngle, endAngle: cumulativeAngle + angle });
      cumulativeAngle += angle;
    }

    // Find the center angle of the winning slot
    const winningSlot = slotAngles.find(s => s.multiplier === multiplier)!;
    const targetAngle = (winningSlot.startAngle + winningSlot.endAngle) / 2;

    // Add multiple full rotations for effect
    const fullRotations = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const finalRotation = -(fullRotations * 360 + targetAngle); // negative for clockwise

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(multiplier);
      setHasSpun(true);
    }, 3000);
  };

  const handleCollect = () => {
    if (result !== null) {
      applyGamble(result);
    }
  };

  const handleSkip = () => {
    skipGamble();
  };

  // Build conic gradient for the wheel
  let gradientStops = '';
  let cumulative = 0;
  for (const slot of GAMBLE_SLOTS) {
    const start = (cumulative / 1) * 360;
    cumulative += slot.probability;
    const end = (cumulative / 1) * 360;
    gradientStops += `${slot.color} ${start}deg ${end}deg, `;
  }
  gradientStops = gradientStops.slice(0, -2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-950 ring-1 ring-white/[0.08]"
      >
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }} />

        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">Gamble</span>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}>All-In?</h2>
            </div>
            <button onClick={handleSkip} disabled={spinning} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-white disabled:opacity-40">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Bet display */}
          <div className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-amber-500/[0.08] px-4 py-3 ring-1 ring-amber-500/20">
            <BottleIcon className="h-5 w-5 text-amber-400" />
            <span className="text-[13px] text-amber-500/70">Bet</span>
            <span className="font-mono text-[20px] font-bold tabular-nums text-amber-300">{gambleBet}</span>
          </div>

          {/* Wheel */}
          <div className="mb-5 flex flex-col items-center">
            <div className="relative h-48 w-48">
              {/* Pointer */}
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
                <div className="h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-white" />
              </div>

              {/* Wheel */}
              <motion.div
                className="h-full w-full rounded-full"
                style={{
                  background: `conic-gradient(${gradientStops})`,
                }}
                animate={{ rotate: rotation }}
                transition={{ duration: spinning ? 3 : 0, ease: spinning ? [0.16, 1, 0.3, 1] : 'linear' }}
              >
                {/* Slot labels */}
                {GAMBLE_SLOTS.map((slot, i) => {
                  let cumAngle = 0;
                  for (let j = 0; j < i; j++) cumAngle += GAMBLE_SLOTS[j].probability * 360;
                  const centerAngle = cumAngle + (slot.probability * 360) / 2;
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 flex items-start justify-center"
                      style={{ transform: `rotate(${centerAngle}deg)` }}
                    >
                      <span className="mt-3 text-[16px] font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        {slot.label}
                      </span>
                    </div>
                  );
                })}
              </motion.div>

              {/* Center dot */}
              <div className="absolute left-1/2 top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950 ring-2 ring-white/20" />
            </div>
          </div>

          {/* Result or Spin button */}
          {hasSpun && result !== null ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
              <div className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-3 ring-1',
                result === 1 ? 'bg-neutral-700/30 ring-neutral-600/30' :
                result === 2 ? 'bg-emerald-500/15 ring-emerald-500/30' :
                result === 3 ? 'bg-amber-500/15 ring-amber-500/30' :
                result === 4 ? 'bg-orange-500/15 ring-orange-500/30' :
                'bg-red-500/15 ring-red-500/30'
              )}>
                <span className="text-[16px] font-bold text-neutral-50">{result}x</span>
                <span className="text-[12px] text-neutral-400">→</span>
                <BottleIcon className="h-4 w-4 text-amber-400" />
                <span className="font-mono text-[18px] font-bold tabular-nums text-amber-300">{gambleBet * result}</span>
              </div>
              <motion.button
                onClick={handleCollect}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-50 px-4 py-3.5 text-[13px] font-medium text-neutral-950 hover:bg-neutral-200"
              >
                <BottleIcon className="h-4 w-4" />
                Collect Pfandflaschen
              </motion.button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2">
              <motion.button
                onClick={handleSpin}
                disabled={spinning}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[13px] font-bold transition-colors',
                  spinning ? 'cursor-wait bg-white/[0.04] text-neutral-500' : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                )}
              >
                {spinning ? 'Spinning...' : 'Spin (All-In)'}
              </motion.button>
              <button
                onClick={handleSkip}
                disabled={spinning}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-medium text-neutral-500 hover:text-neutral-300 disabled:opacity-40"
              >
                Skip — keep {gambleBet} Pfandflaschen
              </button>
            </div>
          )}

          {/* Probability legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[9px] text-neutral-600">
            {GAMBLE_SLOTS.map(s => (
              <span key={s.multiplier} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label} ({(s.probability * 100)}%)
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
