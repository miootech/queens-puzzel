'use client';

import { motion } from 'framer-motion';
import { Crown, EyeOff, Columns2, Smile, ArrowRight } from 'lucide-react';
import { useGameStore } from '@/lib/wordle/gameStore';
import { MODE_CONFIG, type GameMode } from '@/lib/wordle/types';
import { cn } from '@/lib/utils';

const WORDLE_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const MODE_ICONS: Record<GameMode, React.ReactNode> = {
  classic: <Crown className="h-5 w-5" strokeWidth={2.2} />,
  hidden:  <EyeOff className="h-5 w-5" strokeWidth={2.2} />,
  dual:    <Columns2 className="h-5 w-5" strokeWidth={2.2} />,
  emoji:   <Smile className="h-5 w-5" strokeWidth={2.2} />,
};

// Apple-Clean Card Style mit Color-Coding pro Mode
// Jeder Mode hat seine Akzent-Farbe (wie iOS Settings Cards)
const MODE_ACCENTS: Record<GameMode, { bg: string; ring: string; text: string; glow: string }> = {
  classic: {
    bg: 'bg-[#6AAA64]/[0.08]',
    ring: 'ring-[#6AAA64]/25',
    text: 'text-[#6AAA64]',
    glow: 'shadow-[0_0_24px_-6px_rgba(106,170,100,0.3)]',
  },
  hidden: {
    bg: 'bg-[#9B5DE5]/[0.08]',
    ring: 'ring-[#9B5DE5]/25',
    text: 'text-[#9B5DE5]',
    glow: 'shadow-[0_0_24px_-6px_rgba(155,93,229,0.3)]',
  },
  dual: {
    bg: 'bg-[#F18F01]/[0.08]',
    ring: 'ring-[#F18F01]/25',
    text: 'text-[#F18F01]',
    glow: 'shadow-[0_0_24px_-6px_rgba(241,143,1,0.3)]',
  },
  emoji: {
    bg: 'bg-[#EF476F]/[0.08]',
    ring: 'ring-[#EF476F]/25',
    text: 'text-[#EF476F]',
    glow: 'shadow-[0_0_24px_-6px_rgba(239,71,111,0.3)]',
  },
};

export function ModeSelect() {
  const selectMode = useGameStore(s => s.selectMode);
  const modes: GameMode[] = ['classic', 'hidden', 'dual', 'emoji'];

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {modes.map((mode, idx) => {
        const cfg = MODE_CONFIG[mode];
        const accent = MODE_ACCENTS[mode];

        return (
          <motion.button
            key={mode}
            onClick={() => selectMode(mode)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.08 + idx * 0.06,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -2, scale: 1.005 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              'group relative flex items-center gap-3 overflow-hidden rounded-xl bg-[#1a1a1a] px-4 py-4 ring-1 transition-all',
              'ring-[#3A3A3C] hover:ring-[#565758]',
              accent.glow
            )}
          >
            {/* Color-coded Icon */}
            <div className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-105',
              accent.bg,
              accent.ring,
              accent.text
            )}>
              {MODE_ICONS[mode]}
            </div>

            {/* Title + Description */}
            <div className="flex flex-1 flex-col items-start text-left">
              <h3
                className="text-[18px] font-bold tracking-tight text-white"
                style={{ fontFamily: WORDLE_FONT, letterSpacing: '-0.01em' }}
              >
                {cfg.label}
              </h3>
              <p
                className="text-[12px] leading-tight text-[#818384]"
                style={{ fontFamily: WORDLE_FONT }}
              >
                {cfg.description}
              </p>
            </div>

            {/* Color-coded Arrow */}
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all',
              'bg-[#2a2a2a] text-[#565758] ring-1 ring-[#3A3A3C]',
              'group-hover:bg-[#6AAA64] group-hover:text-white group-hover:ring-[#6AAA64]'
            )}>
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
