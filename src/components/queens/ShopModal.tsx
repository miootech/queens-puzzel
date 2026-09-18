'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, X, Lock, Check, Palette,
} from 'lucide-react';
import { BottleIcon } from "@/components/queens/BottleIcon";
import { useQueensStore } from '@/lib/queens/queensStore';
import { cn } from '@/lib/utils';

// ─── Types (müssen mit JSON übereinstimmen) ───
interface ThemeItem {
  id: string; name: string; price: number;
  description: string; rarity: string; colors: string[];
}
interface QueenItem {
  id: string; name: string; price: number;
  description: string; rarity: string; icon: string;
  image?: string;  // optional PNG path, z.B. "/queens/gold.png"
}
interface ShopData {
  themes: ThemeItem[];
  queens: QueenItem[];
}

// ─── Shop JSON importieren ───
// Um neue Items hinzuzufügen: einfach diese JSON-Datei bearbeiten
// → src/lib/queens/shop-items.json
import shopData from '@/lib/queens/shop-items.json';
const SHOP: ShopData = shopData as ShopData;

// ─── Rarity System ───
const RARITY_CONFIG: Record<string, { ring: string; badge: string }> = {
  free:      { ring: 'ring-white/10',            badge: 'text-neutral-400 bg-white/[0.06]' },
  common:    { ring: 'ring-sky-400/30',          badge: 'text-sky-300 bg-sky-400/10' },
  rare:      { ring: 'ring-purple-400/30',       badge: 'text-purple-300 bg-purple-400/10' },
  epic:      { ring: 'ring-amber-400/30',        badge: 'text-amber-300 bg-amber-400/10' },
  legendary: { ring: 'ring-rose-400/30',         badge: 'text-rose-300 bg-rose-400/10' },
};

function getRarity(r: string) {
  return RARITY_CONFIG[r] ?? RARITY_CONFIG.free;
}

// ─── Shop Modal Komponente ───
export function ShopModal() {
  const coins = useQueensStore(s => s.coins);
  const ownedItems = useQueensStore(s => s.ownedItems);
  const activeTheme = useQueensStore(s => s.activeTheme);
  const activeQueen = useQueensStore(s => s.activeQueen);
  const toggleShop = useQueensStore(s => s.toggleShop);
  const buyItem = useQueensStore(s => s.buyItem);
  const setTheme = useQueensStore(s => s.setTheme);
  const setQueen = useQueensStore(s => s.setQueen);

  const [activeTab, setActiveTab] = useState<'themes' | 'queens'>('themes');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={toggleShop}
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
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }} />

        {/* Header (sticky) */}
        <div className="sticky top-0 z-10 bg-neutral-950/95 px-6 pb-3 pt-5 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">Shop</span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}>Skins & Themes</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/[0.08] px-3 py-1.5 ring-1 ring-amber-500/20">
                <BottleIcon className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono text-[13px] font-bold tabular-nums text-amber-300">{coins}</span>
              </div>
              <button onClick={toggleShop} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tab slider */}
          <div className="mt-4 flex w-full gap-1.5 rounded-full bg-white/[0.03] p-1 ring-1 ring-white/[0.05]">
            <motion.button
              onClick={() => setActiveTab('themes')}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all',
                activeTab === 'themes' ? 'bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-neutral-50 ring-1 ring-sky-400/20' : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <Palette className="h-3.5 w-3.5" />
              Themes
              <span className="ml-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-neutral-300">{SHOP.themes.length}</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('queens')}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all',
                activeTab === 'queens' ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-neutral-50 ring-1 ring-amber-400/20' : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <Crown className="h-3.5 w-3.5" />
              Queens
              <span className="ml-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-neutral-300">{SHOP.queens.length}</span>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'themes' ? (
              <motion.div
                key="themes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-2 gap-3"
              >
                {SHOP.themes.map((item, idx) => {
                  const owned = ownedItems.includes(item.id);
                  const isActive = activeTheme === item.id;
                  const canAfford = coins >= item.price;
                  const rarity = getRarity(item.rarity);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className={cn(
                        'relative flex flex-col items-center overflow-hidden rounded-2xl p-4 ring-2 transition-all',
                        isActive ? 'bg-[var(--word-gold)]/[0.1] ring-[var(--word-gold)]/40' : `bg-white/[0.03] ${rarity.ring} hover:ring-white/20`
                      )}
                      style={{ boxShadow: isActive ? '0 4px 20px rgba(244, 208, 63, 0.15)' : '0 2px 12px rgba(0,0,0,0.3)' }}
                    >
                      <div className="absolute right-2 top-2">
                        <span className={cn('rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider', rarity.badge)}>{item.rarity}</span>
                      </div>
                      <div className="mt-2 grid w-full grid-cols-6 gap-0.5 overflow-hidden rounded-xl">
                        {item.colors.slice(0, 12).map((c, i) => (
                          <div key={i} className="aspect-square w-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="mt-3 text-[14px] font-semibold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{item.name}</span>
                      <p className="mt-0.5 text-[10px] text-neutral-500">{item.description}</p>
                      <div className="mt-3 w-full">
                        {owned ? (
                          <motion.button onClick={() => setTheme(item.id)} whileTap={{ scale: 0.95 }} className={cn('flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition-colors', isActive ? 'bg-[var(--word-gold)]/20 text-[var(--word-gold)]' : 'bg-white/[0.1] text-neutral-200 hover:bg-white/[0.15]')}>
                            {isActive ? <><Check className="h-3.5 w-3.5" />Aktiv</> : 'Auswählen'}
                          </motion.button>
                        ) : (
                          <motion.button onClick={() => buyItem(item.id)} disabled={!canAfford} whileTap={{ scale: 0.95 }} className={cn('flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition-colors', canAfford ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'cursor-not-allowed bg-white/[0.02] text-neutral-600')}>
                            {canAfford ? <><BottleIcon className="h-3.5 w-3.5" />{item.price}</> : <><Lock className="h-3.5 w-3.5" />{item.price}</>}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="queens"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-2 gap-3"
              >
                {SHOP.queens.map((item, idx) => {
                  const owned = ownedItems.includes(item.id);
                  const isActive = activeQueen === item.id;
                  const canAfford = coins >= item.price;
                  const rarity = getRarity(item.rarity);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className={cn(
                        'relative flex flex-col items-center overflow-hidden rounded-2xl p-4 ring-2 transition-all',
                        isActive ? 'bg-[var(--word-gold)]/[0.1] ring-[var(--word-gold)]/40' : `bg-white/[0.03] ${rarity.ring} hover:ring-white/20`
                      )}
                      style={{ boxShadow: isActive ? '0 4px 20px rgba(244, 208, 63, 0.15)' : '0 2px 12px rgba(0,0,0,0.3)' }}
                    >
                      <div className="absolute right-2 top-2">
                        <span className={cn('rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider', rarity.badge)}>{item.rarity}</span>
                      </div>
                      <div className="mt-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-500/30 via-rose-500/20 to-purple-500/20 ring-1 ring-white/10" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                        <Crown className={cn('h-8 w-8', isActive ? 'fill-[var(--word-gold)] text-[var(--word-gold)]' : 'fill-amber-300 text-amber-300')} />
                        {item.image && (
                          <img src={item.image} alt={item.name} className="absolute h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        )}
                      </div>
                      <span className="mt-3 text-[14px] font-semibold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{item.name}</span>
                      <p className="mt-0.5 text-[10px] text-neutral-500">{item.description}</p>
                      <div className="mt-3 w-full">
                        {owned ? (
                          <motion.button onClick={() => setQueen(item.id)} whileTap={{ scale: 0.95 }} className={cn('flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition-colors', isActive ? 'bg-[var(--word-gold)]/20 text-[var(--word-gold)]' : 'bg-white/[0.1] text-neutral-200 hover:bg-white/[0.15]')}>
                            {isActive ? <><Check className="h-3.5 w-3.5" />Aktiv</> : 'Auswählen'}
                          </motion.button>
                        ) : (
                          <motion.button onClick={() => buyItem(item.id)} disabled={!canAfford} whileTap={{ scale: 0.95 }} className={cn('flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition-colors', canAfford ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'cursor-not-allowed bg-white/[0.02] text-neutral-600')}>
                            {canAfford ? <><BottleIcon className="h-3.5 w-3.5" />{item.price}</> : <><Lock className="h-3.5 w-3.5" />{item.price}</>}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
