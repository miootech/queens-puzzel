'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LetterState } from '@/lib/wordle/types';
import { COLOR_PRESETS } from '@/lib/wordle/types';
import { useGameStore } from '@/lib/wordle/gameStore';

interface TileProps {
  letter?: string;
  emoji?: string;
  state: LetterState;
  revealed: boolean;
  index: number;
  size?: 'sm' | 'md' | 'lg';
  shake?: boolean;
}

// Wordle-Standard Font Stack: Helvetica/Arial
const WORDLE_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export function Tile({ letter, emoji, state, revealed, index, size = 'md', shake = false }: TileProps) {
  const pastel = useGameStore(s => s.settings.pastel);
  const colors = pastel ? COLOR_PRESETS.pastel : COLOR_PRESETS.classic;

  // Wordle-Standard Größen (1:1 nach NYT Wordle)
  const sizeClasses = {
    sm: 'h-[48px] w-[48px] text-2xl', // Dual-Modus
    md: 'h-[56px] w-[56px] text-2xl sm:h-[62px] sm:w-[62px] sm:text-3xl',
    lg: 'h-[62px] w-[62px] text-3xl sm:h-[72px] sm:w-[72px] sm:text-4xl',
  };

  // Farbe je nach State
  const bg = state === 'empty' || state === 'tbd' ? 'transparent'
    : state === 'correct' ? colors.correct
    : state === 'present' ? colors.present
    : colors.absent;

  // Border je nach State (Wordle-Standard)
  const hasLetter = !!letter || !!emoji;
  const borderColor = state === 'empty' || state === 'tbd'
    ? (hasLetter ? colors.borderTbd : colors.borderEmpty)
    : 'transparent';

  // Text-Farbe: weiß für alle States im Wordle dark theme
  const textColor = '#ffffff';

  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-center font-bold uppercase select-none',
        sizeClasses[size]
      )}
      style={{
        backgroundColor: bg,
        border: `2px solid ${borderColor}`,
        color: textColor,
        fontFamily: emoji ? 'Apple Color Emoji, sans-serif' : WORDLE_FONT,
        fontWeight: 700,
        fontSize: 'inherit',
        borderRadius: '4px',
      }}
      // Wordle-Standard Flip-Animation (X-Achse)
      animate={revealed
        ? { rotateX: [0, -90, 0] }
        : shake
          ? { x: [0, -8, 8, -8, 8, 0] }
          : {}
      }
      transition={revealed
        ? { duration: 0.6, delay: index * 0.12, ease: 'easeInOut' }
        : shake
          ? { duration: 0.5, ease: 'easeInOut' }
          : {}
      }
    >
      <motion.span
        key={`${letter || emoji}-${state}`}
        initial={revealed ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={revealed ? { delay: index * 0.12 + 0.3, duration: 0.1 } : {}}
        className="block w-full text-center"
      >
        {emoji || letter}
      </motion.span>
    </motion.div>
  );
}
