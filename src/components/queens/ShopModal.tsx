'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, X, Lock, Check, Palette, Flame, ShoppingBag,
} from 'lucide-react';
import { BottleIcon } from "@/components/queens/BottleIcon";
import { useQueensStore } from '@/lib/queens/queensStore';
import { cn } from '@/lib/utils';

// ─── Types (müssen mit JSON übereinstimmen) ───
interface ThemeItem {
  id: string; name: string; price: number;
  description: string; rarity: string; colors: string[];
  femboyOnly?: boolean;  // Femboy-only Themes
}
interface QueenItem {
  id: string; name: string; price: number;
  description: string; rarity: string; icon: string;
  image?: string;
  bundleOnly?: boolean;
}
interface BundleItem {
  id: string; name: string; price: number;
  description: string; rarity: string;
  background: string;
  gridColors: string[];
  queenSkins: string[];
}
interface ShopData {
  themes: ThemeItem[];
  queens: QueenItem[];
  bundles: BundleItem[];
}

// ─── Shop JSON importieren ───
// Um neue Items hinzuzufügen: einfach diese JSON-Datei bearbeiten
// → src/lib/queens/shop-items.json
import shopData from '@/lib/queens/shop-items.json';
const SHOP: ShopData = shopData as ShopData;

// ─── Rarity System ───
const RARITY_CONFIG: Record<string, { ring: string; badge: string; glow: string }> = {
  free:      { ring: 'ring-white/10',            badge: 'text-neutral-400 bg-white/[0.06]',                glow: 'rgba(255,255,255,0.04)' },
  common:    { ring: 'ring-sky-400/30',          badge: 'text-sky-300 bg-sky-400/10',                       glow: 'rgba(56,189,248,0.10)' },
  rare:      { ring: 'ring-purple-400/30',       badge: 'text-purple-300 bg-purple-400/10',                  glow: 'rgba(192,132,252,0.10)' },
  epic:      { ring: 'ring-amber-400/30',        badge: 'text-amber-300 bg-amber-400/10',                    glow: 'rgba(251,191,36,0.10)' },
  legendary: { ring: 'ring-rose-400/30',         badge: 'text-rose-300 bg-rose-400/10',                      glow: 'rgba(244,63,94,0.10)' },
};

function getRarity(r: string) {
  return RARITY_CONFIG[r] ?? RARITY_CONFIG.free;
}

// ─── Queen Icon (Bild mit Crown-Fallback) ───
function QueenIcon({ image, name, isActive }: { image?: string; name: string; isActive: boolean }) {
  const [imgError, setImgError] = useState(false);
  if (!image || imgError) {
    return (
      <Crown
        className={cn('h-10 w-10', isActive ? 'fill-[var(--word-gold)] text-[var(--word-gold)]' : 'fill-amber-300 text-amber-300')}
        strokeWidth={1.4}
      />
    );
  }
  // Bild als zentrierter Kreis (konsistent mit Board-Anzeige)
  return (
    <div
      className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/15"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
    >
      <img
        src={image}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

// ─── Uniform Shop Card (für Themes & Queens) ───
function ShopCard({
  isActive,
  rarity,
  badgeLabel,
  iconSlot, // ReactNode fürs Icon (rounded-square container wird hier geliefert)
  name,
  description,
  owned,
  canAfford,
  price,
  onSelect,
  onBuy,
  index,
}: {
  isActive: boolean;
  rarity: ReturnType<typeof getRarity>;
  badgeLabel: string;
  iconSlot: React.ReactNode;
  name: string;
  description: string;
  owned: boolean;
  canAfford: boolean;
  price: number;
  onSelect: () => void;
  onBuy: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={cn(
        'relative flex flex-col items-center overflow-hidden rounded-2xl p-4 ring-2 transition-all',
        isActive ? 'bg-[var(--word-gold)]/[0.1] ring-[var(--word-gold)]/40' : `bg-white/[0.03] ${rarity.ring} hover:ring-white/20`
      )}
      style={{ boxShadow: isActive ? '0 4px 20px rgba(244, 208, 63, 0.15)' : '0 2px 12px rgba(0,0,0,0.3)' }}
    >
      {/* Rarity badge top-right */}
      <div className="absolute right-2 top-2 z-10">
        <span className={cn('rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider', rarity.badge)}>{badgeLabel}</span>
      </div>

      {/* ── Rounded-square icon (zentriert) ── */}
      <div
        className="relative mt-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10"
        style={{ boxShadow: `0 4px 16px ${rarity.glow}, inset 0 1px 0 rgba(255,255,255,0.04)` }}
      >
        {iconSlot}
      </div>

      {/* ── Name pill (hervorgehoben) ── */}
      <div className="mt-3 flex w-full justify-center">
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full px-3 py-1 text-[12px] font-semibold tracking-tight',
            isActive
              ? 'bg-[var(--word-gold)]/20 text-[var(--word-gold)] ring-1 ring-[var(--word-gold)]/30'
              : 'bg-white/[0.06] text-neutral-100 ring-1 ring-white/[0.08]'
          )}
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {name}
        </span>
      </div>

      {/* ── Description ── */}
      <p className="mt-2 min-h-[28px] text-center text-[10px] leading-tight text-neutral-500">{description}</p>

      {/* ── Price / Select button ── */}
      <div className="mt-3 w-full">
        {owned ? (
          <motion.button
            onClick={onSelect}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition-colors',
              isActive ? 'bg-[var(--word-gold)]/20 text-[var(--word-gold)]' : 'bg-white/[0.1] text-neutral-200 hover:bg-white/[0.15]'
            )}
          >
            {isActive ? <><Check className="h-3.5 w-3.5" />Aktiv</> : 'Auswählen'}
          </motion.button>
        ) : (
          <motion.button
            onClick={onBuy}
            disabled={!canAfford}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition-colors',
              canAfford ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'cursor-not-allowed bg-white/[0.02] text-neutral-600'
            )}
          >
            {canAfford ? <><BottleIcon className="h-3.5 w-3.5" />{price}</> : <><Lock className="h-3.5 w-3.5" />{price}</>}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Shop Modal Komponente ───
export function ShopModal() {
  const coins = useQueensStore(s => s.coins);
  const ownedItems = useQueensStore(s => s.ownedItems);
  const activeTheme = useQueensStore(s => s.activeTheme);
  const activeFemboyTheme = useQueensStore(s => s.activeFemboyTheme);
  const activeBundle = useQueensStore(s => s.activeBundle);
  const activeQueen = useQueensStore(s => s.activeQueen);
  const toggleShop = useQueensStore(s => s.toggleShop);
  const buyItem = useQueensStore(s => s.buyItem);
  const setTheme = useQueensStore(s => s.setTheme);
  const setFemboyTheme = useQueensStore(s => s.setFemboyTheme);
  const setBundle = useQueensStore(s => s.setBundle);
  const buyBundle = useQueensStore(s => s.buyBundle);
  const setQueen = useQueensStore(s => s.setQueen);

  // Custom Currency aus aktivem Bundle
  const bundleData = activeBundle ? (SHOP as any).bundles?.find((b: any) => b.id === activeBundle) : null;
  const currencyIcon = bundleData?.currencyIcon;

  const [activeTab, setActiveTab] = useState<'themes' | 'queens' | 'bundles'>('themes');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={toggleShop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl sm:rounded-3xl bg-neutral-950 ring-1 ring-white/[0.08]"
      >
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }} />

        {/* Header (sticky) */}
        <div className="sticky top-0 z-10 bg-neutral-950/95 px-3 sm:px-6 pb-3 pt-4 sm:pt-5 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">Shop</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}>Skins & Themes</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/[0.08] px-2.5 sm:px-3 py-1.5 ring-1 ring-amber-500/20">
                {currencyIcon ? (
                  <img src={currencyIcon} alt="Currency" className="h-4 w-4 object-contain" />
                ) : (
                  <BottleIcon className="h-3.5 w-3.5 text-amber-400" />
                )}
                <span className="font-mono text-[13px] font-bold tabular-nums text-amber-300">{coins}</span>
              </div>
              <button onClick={toggleShop} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tab slider */}
          <div className="mt-3 sm:mt-4 flex w-full gap-1 sm:gap-1.5 rounded-full bg-white/[0.03] p-1 ring-1 ring-white/[0.05]">
            <motion.button
              onClick={() => setActiveTab('themes')}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-full px-2 sm:px-4 py-1.5 text-[11px] sm:text-[13px] font-semibold transition-all',
                activeTab === 'themes' ? 'bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-neutral-50 ring-1 ring-sky-400/20' : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <Palette className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Themes</span>
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-neutral-300">{SHOP.themes.length}</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('queens')}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-full px-2 sm:px-4 py-1.5 text-[11px] sm:text-[13px] font-semibold transition-all',
                activeTab === 'queens' ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-neutral-50 ring-1 ring-amber-400/20' : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <Crown className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Queens</span>
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-neutral-300">{SHOP.queens.filter(q => !q.bundleOnly || ownedItems.includes(q.id)).length}</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('bundles')}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-full px-2 sm:px-4 py-1.5 text-[11px] sm:text-[13px] font-semibold transition-all',
                activeTab === 'bundles' ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-neutral-50 ring-1 ring-emerald-400/20' : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Bundles</span>
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-neutral-300">{(SHOP.bundles ?? []).length}</span>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'themes' ? (
              <motion.div
                key="themes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-4"
              >
                {/* Normale Themes */}
                <div className="grid grid-cols-2 gap-3">
                  {SHOP.themes.filter(t => !t.femboyOnly).map((item, idx) => {
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
                </div>

                {/* Femboy-Extreme-Themes Sektion */}
                <div className="flex items-center gap-2 rounded-xl bg-pink-500/[0.06] px-4 py-2 ring-1 ring-pink-500/15">
                  <Flame className="h-4 w-4 fill-pink-400 text-pink-300" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pink-200">Femboy Extreme Themes</span>
                  <span className="ml-auto text-[10px] text-pink-300/60">Nur im Femboy-Modus aktiv</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {SHOP.themes.filter(t => t.femboyOnly).map((item, idx) => {
                    const owned = ownedItems.includes(item.id);
                    const isActive = activeFemboyTheme === item.id;
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
                          isActive ? 'bg-pink-500/[0.1] ring-pink-400/40' : `bg-white/[0.03] ${rarity.ring} hover:ring-white/20`
                        )}
                        style={{ boxShadow: isActive ? '0 4px 20px rgba(244, 114, 182, 0.15)' : '0 2px 12px rgba(0,0,0,0.3)' }}
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
                            <motion.button onClick={() => setFemboyTheme(item.id)} whileTap={{ scale: 0.95 }} className={cn('flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition-colors', isActive ? 'bg-pink-500/20 text-pink-300' : 'bg-white/[0.1] text-neutral-200 hover:bg-white/[0.15]')}>
                              {isActive ? <><Check className="h-3.5 w-3.5" />Aktiv</> : 'Auswählen'}
                            </motion.button>
                          ) : (
                            <motion.button onClick={() => buyItem(item.id)} disabled={!canAfford} whileTap={{ scale: 0.95 }} className={cn('flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition-colors', canAfford ? 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30' : 'cursor-not-allowed bg-white/[0.02] text-neutral-600')}>
                              {canAfford ? <><BottleIcon className="h-3.5 w-3.5" />{item.price}</> : <><Lock className="h-3.5 w-3.5" />{item.price}</>}
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : activeTab === 'queens' ? (
              <motion.div
                key="queens"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-2 gap-3"
              >
                {SHOP.queens.filter(q => !q.bundleOnly || ownedItems.includes(q.id)).map((item, idx) => {
                  const owned = ownedItems.includes(item.id);
                  const isActive = activeQueen === item.id;
                  const canAfford = coins >= item.price;
                  const rarity = getRarity(item.rarity);
                  return (
                    <ShopCard
                      key={item.id}
                      index={idx}
                      isActive={isActive}
                      rarity={rarity}
                      badgeLabel={item.rarity}
                      name={item.name}
                      description={item.description}
                      owned={owned}
                      canAfford={canAfford}
                      price={item.price}
                      onSelect={() => setQueen(item.id)}
                      onBuy={() => buyItem(item.id)}
                      iconSlot={<QueenIcon image={item.image} name={item.name} isActive={isActive} />}
                    />
                  );
                })}
              </motion.div>
            ) : (
              /* Bundles Tab */
              <motion.div
                key="bundles"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-4"
              >
                {(SHOP.bundles ?? []).map((bundle, idx) => {
                  const owned = ownedItems.includes(bundle.id);
                  const isActive = activeBundle === bundle.id;
                  const canAfford = coins >= bundle.price;
                  const rarity = getRarity(bundle.rarity);
                  return (
                    <motion.div
                      key={bundle.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className={cn(
                        'relative overflow-hidden rounded-2xl p-5 ring-2 transition-all flex flex-col items-center text-center',
                        isActive ? 'bg-emerald-500/[0.08] ring-emerald-400/40' : 'bg-white/[0.03] ring-white/[0.08] hover:ring-white/20'
                      )}
                    >
                      {/* BG Preview */}
                      <div
                        className="relative mb-4 h-32 w-full overflow-hidden rounded-xl ring-1 ring-white/10"
                        style={{ backgroundImage: `url(${bundle.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      >
                        <div className="absolute inset-0 bg-black/30" />
                        {/* Active badge */}
                        {isActive && (
                          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500/30 px-2 py-0.5 ring-1 ring-emerald-400/40">
                            <Check className="h-3 w-3 text-emerald-300" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">Active</span>
                          </div>
                        )}
                        {!isActive && (
                          <div className="absolute right-2 top-2">
                            <span className={cn('rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider', rarity.badge)}>{bundle.rarity}</span>
                          </div>
                        )}
                      </div>

                      {/* Title — zentriert */}
                      <h3 className="text-[18px] font-bold tracking-tight text-neutral-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{bundle.name}</h3>

                      {/* Description — zentriert */}
                      <p className="mt-1 text-[11px] text-neutral-500">{bundle.description}</p>

                      {/* Grid Colors — zentriert, 2 Zeilen × 6 */}
                      <div className="mt-3 grid grid-cols-6 gap-1">
                        {bundle.gridColors.slice(0, 12).map((c, i) => (
                          <div key={i} className="h-5 w-5 rounded-md" style={{ backgroundColor: c, boxShadow: '0 0 0 1px rgba(0,0,0,0.3)' }} />
                        ))}
                      </div>

                      {/* Queen Skins — zentriert, max 5 pro Reihe */}
                      <div className="mt-3 flex flex-wrap justify-center gap-2 max-w-[200px]">
                        {bundle.queenSkins.map(skinId => {
                          const skin = SHOP.queens.find(q => q.id === skinId);
                          if (!skin?.image) return null;
                          return (
                            <div key={skinId} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/[0.04] ring-1 ring-white/10">
                              <img
                                src={skin.image}
                                alt={skin.name}
                                className="h-full w-full object-cover rounded-full"
                                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Buy / Activate / Deactivate Button */}
                      <div className="mt-4 w-full">
                        {owned ? (
                          <motion.button
                            onClick={() => setBundle(isActive ? null : bundle.id)}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              'flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-bold transition-colors',
                              isActive
                                ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30 hover:bg-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/30'
                            )}
                          >
                            {isActive ? <><X className="h-4 w-4" />Deactivate</> : <><Check className="h-4 w-4" />Activate</>}
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={() => buyBundle(bundle.id)}
                            disabled={!canAfford}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              'flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-bold transition-colors',
                              canAfford ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'cursor-not-allowed bg-white/[0.02] text-neutral-600'
                            )}
                          >
                            {canAfford ? <>{currencyIcon ? <img src={currencyIcon} alt="Currency" className="h-4 w-4 object-contain" /> : <BottleIcon className="h-4 w-4" />}{bundle.price.toLocaleString()}</> : <><Lock className="h-4 w-4" />{bundle.price.toLocaleString()}</>}
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
