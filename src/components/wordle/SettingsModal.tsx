'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useGameStore } from '@/lib/wordle/gameStore';
import { cn } from '@/lib/utils';

const WORDLE_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export function SettingsModal() {
  const { view, closeModals, settings, toggleSetting } = useGameStore();
  const isOpen = view === 'settings';

  const items: { key: keyof typeof settings; title: string; desc: string }[] = [
    { key: 'hardMode', title: 'Hard Mode', desc: 'Revealed hints must be used in subsequent guesses' },
    { key: 'pastel', title: 'Pastel Colors', desc: 'Soft pastel tones instead of original Wordle colors' },
    { key: 'darkKeyboard', title: 'Dark Keyboard', desc: 'Dark keyboard layout (always on in Wordle)' },
  ];

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
            className="w-full max-w-md rounded-md bg-[#121213] ring-1 ring-[#3A3A3C]"
          >
            <div className="border-b border-[#3A3A3C] px-6 pb-3 pt-5">
              <div className="flex items-start justify-between">
                <h2
                  className="text-[22px] font-bold tracking-tight text-white"
                  style={{ fontFamily: WORDLE_FONT, letterSpacing: '-0.02em' }}
                >
                  Settings
                </h2>
                <button
                  onClick={closeModals}
                  className="flex h-9 w-9 items-center justify-center rounded text-white hover:bg-[#1a1a1a]"
                >
                  <X className="h-5 w-5" strokeWidth={2.4} />
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4">
              <div className="flex flex-col gap-3">
                {items.map(item => {
                  const active = settings[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleSetting(item.key)}
                      className="flex items-center justify-between text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-white" style={{ fontFamily: WORDLE_FONT }}>{item.title}</span>
                        <span className="text-[12px] text-[#818384]" style={{ fontFamily: WORDLE_FONT }}>{item.desc}</span>
                      </div>
                      {/* Toggle (Wordle-Style) */}
                      <div
                        className={cn(
                          'flex h-7 w-12 items-center rounded-full p-1 transition-colors',
                          active ? 'bg-[#6AAA64]' : 'bg-[#3A3A3C]'
                        )}
                      >
                        <motion.div
                          animate={{ x: active ? 20 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="h-5 w-5 rounded-full bg-white shadow-sm"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
